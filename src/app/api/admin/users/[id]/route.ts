import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, updateUserActive, updateUserPassword, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

// PATCH - Update user (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, value } = body;

    if (action === 'toggleActive') {
      await updateUserActive(id, value);
    } else if (action === 'resetPassword') {
      const passwordHash = await hashPassword(value);
      await updateUserPassword(id, passwordHash);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
