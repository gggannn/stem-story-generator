'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getUserId } from '@/lib/storage';
import { Identity } from '@/types';
import { IDENTITIES } from '@/constants/topics';

interface ExplorerProfile {
  name: string;
  age: number;
  identity?: Identity;
  avatar?: string;
  createdAt: number;
}

const PROFILE_KEY = 'stem_explorer_profile';

function loadProfile(): ExplorerProfile | null {
  if (typeof window === 'undefined') return null;
  const userId = getUserId();
  const key = userId ? `${PROFILE_KEY}_${userId}` : PROFILE_KEY;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveProfile(profile: ExplorerProfile) {
  if (typeof window === 'undefined') return;
  const userId = getUserId();
  const key = userId ? `${PROFILE_KEY}_${userId}` : PROFILE_KEY;
  localStorage.setItem(key, JSON.stringify(profile));
}

interface OnboardingProps {
  onComplete: (profile: ExplorerProfile) => void;
}

// Scan line animation component
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan"
        style={{
          boxShadow: '0 0 20px #22d3ee, 0 0 40px #22d3ee',
        }}
      />
    </div>
  );
}

// Glitch text effect
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-indigo-400 opacity-50 animate-glitch-1" aria-hidden="true">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 text-pink-500 opacity-50 animate-glitch-2" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

export function ExplorerOnboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(8);
  const [identity, setIdentity] = useState<Identity>('explorer');
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleStart = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsTransitioning(true);
    const profile: ExplorerProfile = {
      name: name.trim(),
      age,
      identity,
      createdAt: Date.now(),
    };
    saveProfile(profile);

    setTimeout(() => {
      onComplete(profile);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Main container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-2 border-indigo-400/50 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
            <span className="text-5xl">🚀</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider mb-2">
            STEM 探险者
          </h1>
          <p className="text-white/60 text-base">
            {step === 0 ? '准备好开始你的科学冒险了吗？' : '请建立你的探险者档案'}
          </p>
        </div>

        {/* Form card */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl">
          {step === 0 && (
            <div className="text-center space-y-8">
              <p className="text-white/90 text-lg leading-relaxed">
                欢迎来到 STEM 宇宙！<br />
                在这里，你将化身<span className="text-blue-400 font-bold">科学探险家</span>，<br />
                探索恐龙、宇宙、机器人等奇妙世界。
              </p>
              <button
                onClick={handleStart}
                className="rocket-btn w-full"
              >
                开始创建档案
              </button>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name input */}
              <div>
                <label className="block text-base font-medium text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">1</span>
                  你的探险者代号
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入你的名字..."
                  className="w-full bg-white/5 text-white placeholder-white/40 px-6 py-4 rounded-2xl border border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all text-lg"
                  required
                />
              </div>

              {/* Age selector */}
              <div>
                <label className="block text-base font-medium text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">2</span>
                  你的年龄
                </label>
                <div className="flex flex-wrap gap-2">
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAge(a)}
                      className={`capsule-btn ${
                        age === a ? 'capsule-btn-active' : 'hover:bg-white/10'
                      }`}
                    >
                      {a}岁
                    </button>
                  ))}
                </div>
              </div>

              {/* Identity selector */}
              <div>
                <label className="block text-base font-medium text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">3</span>
                  选择你的探索方式
                </label>
                <div className="space-y-3">
                  {IDENTITIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIdentity(item.id)}
                      className={`w-full p-4 rounded-2xl border transition-all text-left ${
                        identity === item.id
                          ? 'bg-white/20 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.emoji}</span>
                        <div className="flex-1">
                          <div className={`font-bold text-lg ${identity === item.id ? 'text-white' : 'text-white/80'}`}>
                            {item.label}
                          </div>
                          <div className="text-sm text-white/60 mt-1">{item.tagline}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!name.trim() || isTransitioning}
                className="w-full rocket-btn h-14 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isTransitioning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">✨</span>
                    档案生成中...
                  </span>
                ) : (
                  '确认并开启探索'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-slate-950 animate-warp-in">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-radial from-blue-500/20 to-transparent animate-pulse" />
          </div>
        </div>
      )}

      {/* Inline styles for custom animations */}
      <style jsx>{`
        @keyframes warp-in {
          0% {
            transform: scale(1);
            filter: blur(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            filter: blur(20px);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            filter: blur(100px);
            opacity: 0;
          }
        }
        .animate-warp-in {
          animation: warp-in 1.5s ease-in forwards;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
        }
      `}</style>
    </div>
  );
}

// Profile editor component
interface ProfileEditorProps {
  profile: ExplorerProfile;
  onSave: (profile: ExplorerProfile) => void;
  onClose: () => void;
}

export function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [identity, setIdentity] = useState<Identity>(profile.identity || 'explorer');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const updatedProfile: ExplorerProfile = {
      name: name.trim(),
      age,
      identity,
      createdAt: profile.createdAt,
    };
    saveProfile(updatedProfile);

    setTimeout(() => {
      onSave(updatedProfile);
      setIsSaving(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-950/95 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-indigo-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg text-white flex items-center gap-2">
            <span className="text-indigo-400">◆</span>
            探险者资料
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">探险者代号</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">年龄</label>
            <div className="flex flex-wrap gap-2">
              {[5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-all ${
                    age === a
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">探索方式</label>
            <div className="space-y-2">
              {IDENTITIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIdentity(item.id)}
                  className={`w-full p-2 rounded-lg border transition-all text-left ${
                    identity === item.id
                      ? 'bg-indigo-500/20 border-indigo-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${identity === item.id ? 'text-indigo-300' : 'text-white/80'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-white/40">{item.tagline}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSaving}
            className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  );
}

export { loadProfile, saveProfile };
export type { ExplorerProfile };
