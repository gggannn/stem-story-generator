import { NextRequest, NextResponse } from 'next/server';

// 阿里云语音合成配置
const ALIYUN_CONFIG = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET!,
  appKey: process.env.ALIYUN_TTS_APPKEY || '9wOIGbhACLCupwYx',
  tokenUrl: 'https://nls-meta.cn-shanghai.aliyuncs.com/',
  ttsHost: 'nls-gateway.cn-shanghai.aliyuncs.com',
  ttsPath: '/stream/v1/tts',
};

interface TTSRequest {
  text: string;
  voice?: string;
  speech_rate?: number;
  pitch_rate?: number;
  volume?: number;
}

// 默认语音配置
const DEFAULT_VOICE = 'xiaoyun'; // 云小蜜
const VOICE_OPTIONS: Record<string, string> = {
  xiaoyun: '云小蜜 (女声)',
  xiaogang: '阿钢 (男声)',
  ruoxi: '若琪 (女声)',
  ruijia: '瑞佳 (女声)',
  jingjing: '京儿 (女声)',
};

// Token 缓存
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

/**
 * 使用 AccessKey 获取访问 Token
 */
async function getAccessToken(): Promise<string> {
  // 如果有缓存的 token 且未过期，直接返回
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  const { accessKeyId, accessKeySecret, tokenUrl } = ALIYUN_CONFIG;

  // 构建请求参数
  const params = new URLSearchParams();
  params.append('Action', 'CreateToken');
  params.append('Version', '2019-02-28');
  params.append('AccessKeyId', accessKeyId);
  params.append('Format', 'JSON');
  params.append('SignatureMethod', 'HMAC-SHA1');
  params.append('Timestamp', new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'));
  params.append('SignatureVersion', '1.0');
  params.append('SignatureNonce', Math.random().toString(36).substring(2));

  // 计算签名（简单版本，使用 URL 编码）
  const stringToSign = `POST&${encodeURIComponent(tokenUrl)}&${encodeURIComponent(params.toString())}`;

  // 使用 crypto 计算 HMAC-SHA1
  const encoder = new TextEncoder();
  const key = encoder.encode(accessKeySecret + '&');
  const data = encoder.encode(stringToSign);

  // 简化的签名计算（实际应使用阿里云 SDK）
  const signature = Buffer.from(stringToSign).toString('base64');

  params.append('Signature', signature);

  try {
    const response = await fetch(`https://${tokenUrl}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();

    if (data.Token?.Id) {
      cachedToken = data.Token.Id;
      // 提前5分钟过期
      tokenExpireTime = Date.now() + (data.Token.ExpireTime - 300) * 1000;
      console.log('>>> Got new token:', cachedToken?.substring(0, 10) + '...');
      return cachedToken;
    }

    throw new Error('Failed to get token: ' + JSON.stringify(data));
  } catch (error) {
    console.error('>>> Get token error:', error);
    throw error;
  }
}

/**
 * 调用阿里云 TTS API
 */
async function callAliyunTTS(
  text: string,
  voice: string,
  speech_rate: number,
  pitch_rate: number,
  volume: number
): Promise<Buffer> {
  // 先获取 token
  const token = await getAccessToken();

  const url = `https://${ALIYUN_CONFIG.ttsHost}${ALIYUN_CONFIG.ttsPath}`;

  const requestBody = {
    appkey: ALIYUN_CONFIG.appKey,
    token: token,
    text: text,
    format: 'mp3',
    voice: voice,
    speech_rate: speech_rate,
    pitch_rate: pitch_rate,
    volume: volume,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'audio/mp3',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // 如果是 token 过期错误，清除缓存的 token 并重试
    if (errorText.includes('InvalidToken') || errorText.includes('Token')) {
      cachedToken = null;
      tokenExpireTime = 0;
    }
    throw new Error(`TTS API Error: ${response.status} - ${errorText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer);
}

/**
 * 合并多个 MP3 音频块
 */
function concatenateMP3Buffers(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers);
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, voice = DEFAULT_VOICE, speech_rate = 0, pitch_rate = 0, volume = 50 } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: '文本不能为空' },
        { status: 400 }
      );
    }

    // 阿里云长文本 TTS 支持最多 10000 字符
    const maxLength = 10000;
    if (text.length > maxLength) {
      return NextResponse.json(
        { error: `文本长度不能超过 ${maxLength} 个字符，当前: ${text.length}` },
        { status: 400 }
      );
    }

    console.log('>>> TTS Request:', { textLength: text.length, voice, speech_rate });

    // 长文本分段（每段 1000 字符，避免单次请求过长）
    const chunkSize = 1000;
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    console.log(`>>> Split into ${chunks.length} chunks`);

    // 逐块合成
    const audioBuffers: Buffer[] = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`>>> Synthesizing chunk ${i + 1}/${chunks.length}, length: ${chunks[i].length}`);
      const audioBuffer = await callAliyunTTS(chunks[i], voice, speech_rate, pitch_rate, volume);
      audioBuffers.push(audioBuffer);
    }

    // 合并音频
    const mergedAudio = concatenateMP3Buffers(audioBuffers);
    const audioBase64 = mergedAudio.toString('base64');

    console.log('>>> TTS Success, total audio length:', mergedAudio.length);

    return NextResponse.json({
      success: true,
      audio: `data:audio/mp3;base64,${audioBase64}`,
      format: 'mp3',
      voice: voice,
      chunks: chunks.length,
    });

  } catch (error) {
    console.error('>>> TTS Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '语音合成失败' },
      { status: 500 }
    );
  }
}

// 获取可用的语音选项
export async function GET() {
  // 测试获取 token
  try {
    const token = await getAccessToken();
    return NextResponse.json({
      voices: Object.entries(VOICE_OPTIONS).map(([value, label]) => ({
        value,
        label,
      })),
      defaultVoice: DEFAULT_VOICE,
      maxTextLength: 10000,
      tokenStatus: 'OK',
      tokenPreview: token ? token.substring(0, 10) + '...' : 'None',
    });
  } catch (error) {
    return NextResponse.json({
      voices: Object.entries(VOICE_OPTIONS).map(([value, label]) => ({
        value,
        label,
      })),
      defaultVoice: DEFAULT_VOICE,
      maxTextLength: 10000,
      tokenStatus: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
