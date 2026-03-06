import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getPool } from './db';
import type { User, UserRecord, JwtPayload, CreateUserInput } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const TOKEN_EXPIRY = '7d';

// Internal type for createUser (with passwordHash already hashed)
type CreateUserWithHashInput = Omit<CreateUserInput, 'password'> & {
  passwordHash: string;
};

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// User CRUD
export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
    [username]
  );
  const users = rows as any[];
  return users.length > 0 ? mapDbUserToUserRecord(users[0]) : null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, username, display_name, role, is_active, created_at, last_login_at FROM users WHERE phone = ? AND is_active = TRUE',
    [phone]
  );
  const users = rows as any[];
  return users.length > 0 ? mapDbUserToUser(users[0]) : null;
}

export async function createUserByPhone(phone: string): Promise<User> {
  const pool = getPool();
  const id = crypto.randomUUID();
  const now = Date.now();

  await pool.query(
    'INSERT INTO users (id, username, phone, display_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, TRUE, ?)',
    [id, phone, phone, phone, 'user', now]
  );

  return {
    id,
    username: phone,
    displayName: phone,
    role: 'user',
    isActive: true,
    createdAt: now,
    lastLoginAt: null,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, username, display_name, role, is_active, created_at, last_login_at FROM users WHERE id = ? AND is_active = TRUE',
    [id]
  );
  const users = rows as any[];
  return users.length > 0 ? mapDbUserToUser(users[0]) : null;
}

export async function createUser(data: CreateUserWithHashInput): Promise<User> {
  const pool = getPool();
  const id = crypto.randomUUID();
  const now = Date.now();

  await pool.query(
    'INSERT INTO users (id, username, password_hash, display_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, TRUE, ?)',
    [id, data.username, data.passwordHash, data.displayName || data.username, data.role || 'user', now]
  );

  return {
    id,
    username: data.username,
    displayName: data.displayName || data.username,
    role: data.role || 'user',
    isActive: true,
    createdAt: now,
    lastLoginAt: null,
  };
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const pool = getPool();
  await pool.query('UPDATE users SET last_login_at = ? WHERE id = ?', [Date.now(), userId]);
}

export async function getAllUsers(): Promise<User[]> {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, username, display_name, role, is_active, created_at, last_login_at FROM users ORDER BY created_at DESC'
  );
  const users = rows as any[];
  return users.map(mapDbUserToUser);
}

export async function updateUserActive(userId: string, isActive: boolean): Promise<void> {
  const pool = getPool();
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const pool = getPool();
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

// Session utilities
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return getUserById(payload.userId);
}

// Cookie helpers
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// Helper function to map DB row to UserRecord
function mapDbUserToUserRecord(row: any): UserRecord {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    passwordHash: row.password_hash,
  };
}

// Helper function to map DB row to User
function mapDbUserToUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}
