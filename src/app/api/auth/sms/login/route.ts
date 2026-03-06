import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/verification';
import { getUserByPhone, createUserByPhone, updateUserLastLogin, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: '手机号和验证码不能为空' }, { status: 400 });
    }

    const verification = await verifyCode(phone, code);
    if (!verification.valid) {
      return NextResponse.json(
        { error: '验证码错误或已过期', attemptsLeft: verification.attemptsLeft },
        { status: 400 }
      );
    }

    let user = await getUserByPhone(phone);
    const isNewUser = !user;

    if (!user) {
      user = await createUserByPhone(phone);
    }

    await updateUserLastLogin(user.id);

    const token = generateToken({ userId: user.id });
    await setAuthCookie(token);

    return NextResponse.json({ user, token, isNewUser });
  } catch (error) {
    console.error('SMS login error:', error);
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
