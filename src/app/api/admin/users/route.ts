import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, createUser, hashPassword } from '@/lib/auth';
import type { CreateUserInput } from '@/types';

export const runtime = 'nodejs';

// GET - List all users (admin only)
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const users = await getAllUsers();
  return NextResponse.json({ users });
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, displayName, role } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ username, passwordHash, displayName, role });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
  }
}
