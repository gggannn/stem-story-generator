import { NextRequest, NextResponse } from 'next/server';
import { generateCode, storeCode, checkRateLimit, recordSend } from '@/lib/verification';
import { sendVerificationCode } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: '手机号格式错误' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const rateLimit = await checkRateLimit(phone, ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '发送过于频繁，请稍后再试', cooldown: rateLimit.cooldown },
        { status: 429 }
      );
    }

    const code = generateCode();
    await storeCode(phone, code, ip);

    const sent = await sendVerificationCode(phone, code);
    if (!sent) {
      return NextResponse.json({ error: '短信发送失败' }, { status: 500 });
    }

    await recordSend(phone, ip);

    return NextResponse.json({ success: true, expiresIn: 300 });
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json({ error: '发送失败' }, { status: 500 });
  }
}
