'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getUserId } from '@/lib/storage';

interface ExplorerProfile {
  name: string;
  age: number;
  avatar: string;
  createdAt: number;
}

// STEM-themed avatars for kids
const AVATARS = [
  { id: 'astronaut', emoji: '🧑‍🚀', name: '宇航员', gradient: 'from-blue-500 to-purple-600' },
  { id: 'scientist', emoji: '🧪', name: '小科学家', gradient: 'from-green-500 to-teal-600' },
  { id: 'robot', emoji: '🤖', name: '机器人', gradient: 'from-slate-500 to-slate-700' },
  { id: 'inventor', emoji: '🔬', name: '发明家', gradient: 'from-amber-500 to-orange-600' },
  { id: 'alien', emoji: '👽', name: '外星探险家', gradient: 'from-emerald-500 to-green-600' },
  { id: 'dino', emoji: '🦕', name: '恐龙博士', gradient: 'from-orange-500 to-red-600' },
  { id: 'ocean', emoji: '🐙', name: '海洋探险家', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'star', emoji: '⭐', name: '星星收藏家', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'rocket', emoji: '🚀', name: '火箭驾驶员', gradient: 'from-red-500 to-pink-600' },
  { id: 'rocket_girl', emoji: '👩‍🚀', name: '女航天员', gradient: 'from-violet-500 to-purple-600' },
  { id: 'dragon', emoji: '🐉', name: '龙骑士', gradient: 'from-rose-500 to-red-600' },
  { id: 'super', emoji: '🦸', name: '科学超人', gradient: 'from-sky-500 to-blue-600' },
];

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
      <span className="absolute top-0 left-0 -z-10 text-cyan-400 opacity-50 animate-glitch-1" aria-hidden="true">
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
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [step, setStep] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleStart = () => {
    setStep(1);
    setIsScanning(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsTransitioning(true);
    const profile: ExplorerProfile = {
      name: name.trim(),
      age,
      avatar,
      createdAt: Date.now(),
    };
    saveProfile(profile);

    setTimeout(() => {
      onComplete(profile);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      {/* Scanning effect */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 animate-pulse opacity-30">
            <div className="h-full w-full bg-[linear-gradient(0deg,transparent_50%,rgba(34,211,238,0.1)_50%)] bg-[length:100%_4px]" />
          </div>
        </div>
      )}

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 relative">
            {/* Scanning ring */}
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping" />
            <div className="absolute inset-0 border border-cyan-500/50 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
            <svg
              className="w-12 h-12 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h1 className="font-mono text-2xl md:text-3xl font-bold text-cyan-400 tracking-wider">
            <GlitchText text="STEM 探险者" />
          </h1>
          <p className="font-mono text-slate-500 text-sm mt-2">
            {isScanning ? '>> 系统初始化中...' : '>> 准备就绪'}
          </p>
        </div>

        {/* Form card */}
        <div className="relative bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-2xl p-6 md:p-8">
          <ScanLine />

          {step === 0 && (
            <div className="text-center">
              <p className="font-mono text-slate-300 mb-6 leading-relaxed">
                欢迎来到 STEM 宇宙！<br />
                <span className="text-cyan-400">成为探险者</span>，开启科学冒险之旅
              </p>
              <button
                onClick={handleStart}
                className="group relative px-8 py-3 bg-transparent border border-cyan-500/50 text-cyan-400 font-mono font-bold rounded-lg overflow-hidden transition-all hover:border-cyan-400"
              >
                <span className="relative z-10">开始初始化 &gt;&gt;</span>
                <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform" />
              </button>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name input */}
              <div>
                <label className="block font-mono text-sm text-cyan-400 mb-2">
                  <span className="text-slate-500">01.</span> 探险者代号
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入你的名字..."
                  className="w-full bg-slate-950/50 text-slate-200 font-mono placeholder-slate-600 px-4 py-3 rounded-lg border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Age selector */}
              <div>
                <label className="block font-mono text-sm text-cyan-400 mb-2">
                  <span className="text-slate-500">02.</span> 探险家年龄
                </label>
                <div className="flex flex-wrap gap-2">
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAge(a)}
                      className={`px-4 py-2 font-mono rounded-lg border transition-all ${
                        age === a
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'bg-slate-950/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {a}岁
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar selector */}
              <div>
                <label className="block font-mono text-sm text-cyan-400 mb-2">
                  <span className="text-slate-500">03.</span> 选择你的身份
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATARS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAvatar(a.id)}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                        ${avatar === a.id
                          ? 'bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-950/50 border-slate-700 hover:border-slate-600'
                        }
                      `}
                    >
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${a.gradient} flex items-center justify-center text-2xl shadow-lg mb-2`}>
                        {a.emoji}
                      </div>
                      <span className={`text-xs font-medium ${avatar === a.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {a.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!name.trim() || isTransitioning}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-mono font-bold rounded-lg transition-all hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTransitioning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">✦</span>
                    光速传输中...
                  </span>
                ) : (
                  '>> 确认初始化'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Decorative elements */}
        <div className="mt-6 font-mono text-xs text-slate-600 text-center space-y-1">
          <p>SYSTEM: v1.0.0 | MODE: EXPLORER</p>
          <p className="text-slate-700">◆ ◆ ◆</p>
        </div>
      </div>

      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-slate-950 animate-warp-in">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-radial from-cyan-500/20 to-transparent animate-pulse" />
          </div>
        </div>
      )}

      {/* Inline styles for custom animations */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
        }
        .animate-glitch-1 {
          animation: glitch-1 3s ease-in-out infinite;
        }
        .animate-glitch-2 {
          animation: glitch-2 2s ease-in-out infinite;
        }
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
  const [avatar, setAvatar] = useState(profile.avatar || AVATARS[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const updatedProfile: ExplorerProfile = {
      name: name.trim(),
      age,
      avatar,
      createdAt: profile.createdAt,
    };
    saveProfile(updatedProfile);

    setTimeout(() => {
      onSave(updatedProfile);
      setIsSaving(false);
      onClose();
    }, 500);
  };

  // Use Portal to render at document.body level to avoid z-index conflicts with 3D Canvas
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-[10000] bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-lg text-cyan-400 flex items-center gap-2">
            <span className="text-slate-500">◆</span>
            探险者资料
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-slate-500 mb-2">探险者代号</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 font-mono px-4 py-2 rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-500 mb-2">年龄</label>
            <div className="flex flex-wrap gap-2">
              {[5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={`px-3 py-1 font-mono text-sm rounded-lg border transition-all ${
                    age === a
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-500 mb-2">选择身份</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatar(a.id)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
                    ${avatar === a.id
                      ? 'bg-slate-800 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.gradient} flex items-center justify-center text-xl shadow-md mb-1`}>
                    {a.emoji}
                  </div>
                  <span className={`text-[10px] font-medium ${avatar === a.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {a.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSaving}
            className="w-full py-2 bg-cyan-500/20 text-cyan-400 font-mono border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export { loadProfile, saveProfile };
export type { ExplorerProfile };
