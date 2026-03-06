import crypto from 'crypto';

const ALIYUN_CONFIG = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID!,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET!,
  signName: process.env.ALIYUN_SMS_SIGN_NAME || 'STEM故事',
  templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE!,
};

function computeSignature(parameters: Record<string, string>, accessKeySecret: string): string {
  const sortedParams = Object.keys(parameters).sort();
  const canonicalizedQueryString = sortedParams
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
    .join('&');
  const stringToSign = `GET&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`;
  return crypto
    .createHmac('sha1', accessKeySecret + '&')
    .update(stringToSign, 'utf8')
    .digest('base64');
}

export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  const params: Record<string, string> = {
    Action: 'SendSms',
    Version: '2017-05-25',
    AccessKeyId: ALIYUN_CONFIG.accessKeyId,
    Format: 'JSON',
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    SignatureVersion: '1.0',
    SignatureNonce: Math.random().toString(36).substring(2, 15),
    PhoneNumbers: phone,
    SignName: ALIYUN_CONFIG.signName,
    TemplateCode: ALIYUN_CONFIG.templateCode,
    TemplateParam: JSON.stringify({ code }),
  };

  params.Signature = computeSignature(params, ALIYUN_CONFIG.accessKeySecret);

  const url = `https://dysmsapi.aliyuncs.com/?${new URLSearchParams(params).toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.Code !== 'OK') {
    console.error('Aliyun SMS error:', data);
  }

  return data.Code === 'OK';
}
