'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CosmicVoid } from '@/components/CosmicVoid';
import { Rocket } from 'lucide-react';
import SmsLoginForm from '@/components/SmsLoginForm';

export default function LoginPage() {
  const { login, loginWithSms, user, isLoading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'password' | 'sms'>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSmsSuccess = () => {
    router.push('/');
  };

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

  // Don't show login form if already logged in
  if (user) {
    return (
      <>
        <CosmicVoid />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-cyan-400">正在跳转...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <CosmicVoid />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-slate-950/95 backdrop-blur-sm rounded-2xl border border-indigo-500/30 p-8 shadow-2xl shadow-indigo-500/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/20 rounded-full mb-4">
                <Rocket className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">STEM 故事宇宙</h1>
              <p className="text-white/60">登录开始你的探索之旅</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode('password')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  mode === 'password'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500'
                    : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                密码登录
              </button>
              <button
                type="button"
                onClick={() => setMode('sms')}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  mode === 'sms'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500'
                    : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                验证码登录
              </button>
            </div>

            {/* Forms */}
            {mode === 'password' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">用户名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="输入用户名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="输入密码"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '登录中...' : '登录'}
                </button>
              </form>
            ) : (
              <SmsLoginForm onSuccess={handleSmsSuccess} />
            )}
          </div>

          {/* Decorative footer */}
          <div className="mt-6 text-center text-xs text-white/40">
            <p>SYSTEM: v1.0.0 | MODE: SECURE</p>
          </div>
        </div>
      </div>
    </>
  );
}
