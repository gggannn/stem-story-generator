import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/verification';
import { getUserByPhone, createUserByPhone, updateUserLastLogin, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();
    console.log('>>> Login attempt:', { phone, code });

    if (!phone || !code) {
      return NextResponse.json({ error: '手机号和验证码不能为空' }, { status: 400 });
    }

    console.log('>>> Verifying code...');
    const verification = await verifyCode(phone, code);
    console.log('>>> Verification result:', verification);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: '验证码错误或已过期', attemptsLeft: verification.attemptsLeft },
        { status: 400 }
      );
    }

    console.log('>>> Getting user by phone...');
    let user = await getUserByPhone(phone);
    console.log('>>> User found:', user);
    
    const isNewUser = !user;

    if (!user) {
      console.log('>>> Creating new user...');
      user = await createUserByPhone(phone);
      console.log('>>> New user created:', user);
    }

    console.log('>>> Updating last login...');
    await updateUserLastLogin(user.id);

    console.log('>>> Generating token...');
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    console.log('>>> Creating response...');
    const response = NextResponse.json({ user, token, isNewUser });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    console.log('>>> Login successful');
    return response;
  } catch (error) {
    console.error('SMS login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
