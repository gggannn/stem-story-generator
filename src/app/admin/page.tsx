'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CosmicVoid } from '@/components/CosmicVoid';
import type { User } from '@/types';

export default function AdminPage() {
  const { user, isLoading, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '', role: 'user' as 'user' | 'admin' });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    } else {
      setMessage('获取用户列表失败');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  if (isLoading) {
    return (
      <>
        <CosmicVoid />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-cyan-400">加载中...</div>
        </div>
      </>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <>
        <CosmicVoid />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 text-center">
            <p className="text-red-400 mb-4">无权限访问</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
            >
              返回首页
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    setIsSubmitting(false);

    if (res.ok) {
      setMessage('用户创建成功');
      setNewUser({ username: '', password: '', displayName: '', role: 'user' });
      setShowAddUser(false);
      fetchUsers();
    } else {
      const data = await res.json();
      setMessage(data.error || '创建失败');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggleActive', value: !isActive }),
    });
    if (res.ok) {
      fetchUsers();
    } else {
      setMessage('更新失败');
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPass = prompt(`为用户 "${userName}" 设置新密码:`);
    if (newPass && newPass.trim()) {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetPassword', value: newPass }),
      });
      if (res.ok) {
        setMessage('密码已重置');
      } else {
        setMessage('重置密码失败');
      }
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <>
      <CosmicVoid />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">用户管理</h1>
                <p className="text-slate-400 text-sm">管理员面板</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  返回首页
                </button>
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
                >
                  添加用户
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-6 p-4 bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl">
              <p className="text-cyan-400">{message}</p>
            </div>
          )}

          {/* Add User Form */}
          {showAddUser && (
            <div className="mb-6 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">创建新用户</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">用户名</label>
                    <input
                      placeholder="输入用户名"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">密码</label>
                    <input
                      type="password"
                      placeholder="输入密码"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">显示名称</label>
                    <input
                      placeholder="输入显示名称（可选）"
                      value={newUser.displayName}
                      onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">角色</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="user">普通用户</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? '创建中...' : '创建'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users List */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">用户列表</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800/50 rounded-xl gap-3">
                  <div className="flex-1">
                    <div className="text-white font-medium">{u.displayName || u.username}</div>
                    <div className="text-sm text-slate-400">
                      @{u.username} • {u.role === 'admin' ? '管理员' : '用户'} • {u.isActive ? '启用' : '禁用'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      创建时间: {formatDate(u.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(u.id, u.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        u.isActive
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      }`}
                    >
                      {u.isActive ? '禁用' : '启用'}
                    </button>
                    <button
                      onClick={() => handleResetPassword(u.id, u.username)}
                      className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      重置密码
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  暂无用户
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
