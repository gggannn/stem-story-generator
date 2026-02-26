import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken, getUserByUsername, updateUserLastLogin } from '@/lib/auth';
import type { LoginRequest, LoginResponse } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // Update last login
    await updateUserLastLogin(user.id);

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Create response
    const responseData: LoginResponse = {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      token,
    };

    const response = NextResponse.json(responseData);

    // Set cookie
    // Note: secure=false allows cookie over HTTP (change to true when using HTTPS)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false,  // Allow HTTP for now (enable when HTTPS is configured)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
