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

    // 测试阿里云短信（临时强制启用）
    console.log('>>> 尝试发送阿里云短信...');
    const sent = await sendVerificationCode(phone, code);
    console.log('>>> 发送结果:', sent);
    
    if (!sent) {
      // 开发模式fallback：输出到控制台
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(50));
        console.log(`📱 验证码发送失败，使用开发模式`);
        console.log(`手机号: ${phone}`);
        console.log(`验证码: ${code}`);
        console.log('='.repeat(50));
        await recordSend(phone, ip);
        return NextResponse.json({ success: true, expiresIn: 300 });
      }
      return NextResponse.json({ error: '短信发送失败' }, { status: 500 });
    }

    await recordSend(phone, ip);
    console.log('>>> 阿里云短信发送成功！');
    return NextResponse.json({ success: true, expiresIn: 300 });
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json({ error: '发送失败' }, { status: 500 });
  }
}
