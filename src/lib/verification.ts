import { getPool } from './db';

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeCode(phone: string, code: string, ip: string): Promise<void> {
  const pool = getPool();
  const id = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes

  await pool.query(
    'INSERT INTO sms_verification_codes (id, phone, code, created_at, expires_at, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
    [id, phone, code, now, expiresAt, ip]
  );
}

export async function verifyCode(phone: string, code: string): Promise<{ valid: boolean; attemptsLeft?: number }> {
  const pool = getPool();
  const now = Date.now();

  const [rows] = await pool.query(
    'SELECT * FROM sms_verification_codes WHERE phone = ? AND expires_at > ? AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
    [phone, now]
  );
  const codes = rows as any[];

  if (codes.length === 0) {
    return { valid: false };
  }

  const record = codes[0];

  if (record.attempts >= 3) {
    return { valid: false, attemptsLeft: 0 };
  }

  if (record.code !== code) {
    await pool.query(
      'UPDATE sms_verification_codes SET attempts = attempts + 1 WHERE id = ?',
      [record.id]
    );
    return { valid: false, attemptsLeft: 2 - record.attempts };
  }

  await pool.query(
    'UPDATE sms_verification_codes SET verified = TRUE WHERE id = ?',
    [record.id]
  );

  return { valid: true };
}

export async function checkRateLimit(phone: string, ip: string): Promise<{ allowed: boolean; cooldown?: number }> {
  const pool = getPool();
  const now = Date.now();

  // Phone: 60s/1次, 1h/5次, 24h/10次
  const [phoneRecent] = await pool.query(
    'SELECT COUNT(*) as count FROM sms_rate_limits WHERE phone = ? AND sent_at > ?',
    [phone, now - 60 * 1000]
  );
  if ((phoneRecent as any[])[0].count > 0) {
    return { allowed: false, cooldown: 60 };
  }

  const [phoneHourly] = await pool.query(
    'SELECT COUNT(*) as count FROM sms_rate_limits WHERE phone = ? AND sent_at > ?',
    [phone, now - 60 * 60 * 1000]
  );
  if ((phoneHourly as any[])[0].count >= 5) {
    return { allowed: false, cooldown: 3600 };
  }

  const [phoneDaily] = await pool.query(
    'SELECT COUNT(*) as count FROM sms_rate_limits WHERE phone = ? AND sent_at > ?',
    [phone, now - 24 * 60 * 60 * 1000]
  );
  if ((phoneDaily as any[])[0].count >= 10) {
    return { allowed: false, cooldown: 86400 };
  }

  // IP: 10s/1次, 1h/20次, 24h/50次
  const [ipRecent] = await pool.query(
    'SELECT COUNT(*) as count FROM sms_rate_limits WHERE ip_address = ? AND sent_at > ?',
    [ip, now - 10 * 1000]
  );
  if ((ipRecent as any[])[0].count > 0) {
    return { allowed: false, cooldown: 10 };
  }

  const [ipHourly] = await pool.query(
    'SELECT COUNT(*) as count FROM sms_rate_limits WHERE ip_address = ? AND sent_at > ?',
    [ip, now - 60 * 60 * 1000]
  );
  if ((ipHourly as any[])[0].count >= 20) {
    return { allowed: false, cooldown: 3600 };
  }

  const [ipDaily] = await pool.query(
    'SELECT COUNT(*) as count FROM sms_rate_limits WHERE ip_address = ? AND sent_at > ?',
    [ip, now - 24 * 60 * 60 * 1000]
  );
  if ((ipDaily as any[])[0].count >= 50) {
    return { allowed: false, cooldown: 86400 };
  }

  return { allowed: true };
}

export async function recordSend(phone: string, ip: string): Promise<void> {
  const pool = getPool();
  const id = crypto.randomUUID();
  await pool.query(
    'INSERT INTO sms_rate_limits (id, phone, ip_address, sent_at) VALUES (?, ?, ?, ?)',
    [id, phone, ip, Date.now()]
  );
}
