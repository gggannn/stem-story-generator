'use client';

import React, { useState, useEffect } from 'react';
import { ThemeDomain, Topic, Age, StoryMode, Duration, HistoryItem, CachedStory, Story, User } from '@/types';
import { themeDomains, getTopicFromSubTheme } from '@/config/theme-config';
import { ModeToggle } from '@/components/ModeToggle';
import { DurationCapsule } from '@/components/DurationCapsule';
import { HistoryList } from '@/components/HistoryList';
import { ProfileEditor, loadProfile } from '@/components/ExplorerOnboarding';
import { ThemeExplorer } from '@/components/ThemeExplorer';
import { getUserId, saveToStorage, loadCachedStory, saveCachedStory } from '@/lib/storage';
import type { ExplorerProfile } from '@/components/ExplorerOnboarding';
import { Sparkles, RefreshCw, Loader2, Rocket, ChevronDown, ChevronRight, X, LogOut } from 'lucide-react';

// STEM-themed avatars (same as in ExplorerOnboarding)
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

// Loading messages
const loadingMessages = [
  '正在联络外星科学家...',
  '正在组装有趣的故事...',
  '正在收集科学知识...',
  '正在施放创意魔法...',
  '正在打开知识宝库...',
];

// Storage keys
const HISTORY_KEY = 'stem_story_history' as const;

function getCacheKey(mode: StoryMode, age: Age, topic: Topic, minutes: Duration): string {
  const suffix = mode === 'bedtime' ? minutes : 'A4';
  return `${mode}|${age}|${topic}|${suffix}|zh`;
}

interface SpaceExplorerProps {
  profile: ExplorerProfile;
  onProfileUpdate: (profile: ExplorerProfile) => void;
  onStoryGenerated: (story: Story, mode: StoryMode) => void;
  history: HistoryItem[];
  initialAge?: Age;
  initialMode?: StoryMode;
  user?: User | null;
  onLogout?: () => void;
}

export function SpaceExplorer({
  profile,
  onProfileUpdate,
  onStoryGenerated,
  history,
  initialAge,
  initialMode,
  user,
  onLogout,
}: SpaceExplorerProps) {
  const userId = getUserId();
  const [selectedDomain, setSelectedDomain] = useState<ThemeDomain | null>(null);
  const [expandedSubTheme, setExpandedSubTheme] = useState<string | null>(null);
  const [age, setAge] = useState<Age>(initialAge || (profile.age as Age) || 8);
  const [mode, setMode] = useState<StoryMode>(initialMode || 'bedtime');
  const [minutes, setMinutes] = useState<Duration>(10);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('正在准备魔法...');
  const [error, setError] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>(history);

  // Get current avatar from profile
  const currentAvatar = AVATARS.find(a => a.id === profile.avatar) || AVATARS[0];

  // Update local history when prop changes
  useEffect(() => {
    setLocalHistory(history);
  }, [history]);

  const handleDomainClick = (domain: ThemeDomain) => {
    if (selectedDomain?.id === domain.id) {
      setSelectedDomain(null);
      setExpandedSubTheme(null);
    } else {
      setSelectedDomain(domain);
      setExpandedSubTheme(null);
    }
  };

  const handleSubThemeClick = (subThemeId: string) => {
    if (expandedSubTheme === subThemeId) {
      setExpandedSubTheme(null);
    } else {
      setExpandedSubTheme(subThemeId);
    }
  };

  const generateStory = async (
    targetTopic: Topic,
    targetAge: Age,
    targetMode: StoryMode,
    targetMinutes: Duration,
    forceGenerate: boolean = false
  ) => {
    const cacheKey = getCacheKey(targetMode, targetAge, targetTopic, targetMinutes);

    if (!forceGenerate) {
      const cached = loadCachedStory(cacheKey, userId);
      if (cached) {
        setLocalHistory(prev => {
          const newHistoryItem: HistoryItem = {
            id: crypto.randomUUID(),
            key: cacheKey,
            mode: targetMode,
            title: cached.story.title,
            topic: targetTopic,
            timestamp: Date.now(),
          };
          const newHistory = [newHistoryItem, ...prev].slice(0, 3);
          saveToStorage(HISTORY_KEY, userId, newHistory);
          return newHistory;
        });
        onStoryGenerated(cached.story, targetMode);
        return;
      }
    }

    setCurrentStory(null);
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: targetMode,
          age: targetAge,
          topic: targetTopic,
          minutes: targetMinutes,
          lang: 'zh',
          mood: targetMode === 'bedtime' ? 'sleepy' : 'curious',
          level: targetAge <= 6 ? 'L1' : targetAge <= 9 ? 'L2' : 'L3',
          explorer_name: profile.name,
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败，请重试');
      }

      const story = await response.json();

      const cachedStory: CachedStory = {
        key: cacheKey,
        story,
        mode: targetMode,
        timestamp: Date.now(),
        params: { age: targetAge, topic: targetTopic, minutes: targetMinutes },
      };
      saveCachedStory(cachedStory, userId);

      setLocalHistory(prev => {
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          key: cacheKey,
          mode: targetMode,
          title: story.title,
          topic: targetTopic,
          timestamp: Date.now(),
        };
        const newHistory = [newHistoryItem, ...prev].slice(0, 3);
        saveToStorage(HISTORY_KEY, userId, newHistory);
        return newHistory;
      });

      onStoryGenerated(story, targetMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromSubTheme = (subThemeId: string) => {
    if (!selectedDomain) return;

    const topic = getTopicFromSubTheme(selectedDomain.id, subThemeId);
    if (!topic) {
      setError('该主题暂无可用内容');
      return;
    }

    generateStory(topic, age, mode, minutes, true);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    const cached = loadCachedStory(item.key, userId);
    if (cached) {
      onStoryGenerated(cached.story, cached.mode);
      setMode(cached.mode);
    }
  };

  const setCurrentStory = (story: Story | null) => {
    // This is handled by parent
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Cool Profile Display */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚀</div>
            <h1 className="text-xl font-bold text-slate-200">STEM 宇宙探索器</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfileEditor(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
            >
              <span className="text-lg">👤</span>
              <span className="font-medium">{profile.name}</span>
            </button>
            {user && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                title="登出"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {user && user.role === 'admin' && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                title="管理面板"
              >
                <span className="text-xs font-medium">管理</span>
              </button>
            )}
          </div>
        </div>

        {/* Cool Profile Badge - Click to edit */}
        <button
          onClick={() => setShowProfileEditor(true)}
          className="w-full group mb-6 relative"
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity blur" />

          {/* Main card */}
          <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${currentAvatar.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                    {currentAvatar.emoji}
                  </div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">探险家</p>
                  <p className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {profile.name}
                    <span className="ml-2 text-xs text-slate-500 group-hover:hidden">点击修改</span>
                  </p>
                </div>
              </div>

              {/* Age Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">年龄</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {age} 岁
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  🎂
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm text-slate-400">探索次数: <span className="text-cyan-400 font-semibold">{localHistory.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm text-slate-400">身份: <span className="text-purple-400 font-semibold">{currentAvatar.name}</span></span>
                </div>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                <span>点击修改资料</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </button>

        {/* Quick Settings Bar */}
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-800 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">探索模式</label>
                <ModeToggle mode={mode} onChange={setMode} compact />
              </div>
              {mode === 'bedtime' && (
                <div>
                  <label className="text-xs text-slate-500 block mb-1">故事时长</label>
                  <DurationCapsule selected={minutes} onChange={setMinutes} disabled={false} compact />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-4 p-4 bg-slate-900/80 border border-cyan-500/30 rounded-xl flex items-center justify-center gap-3">
            <Rocket className="w-5 h-5 text-cyan-400 animate-bounce" />
            <span className="text-cyan-400 font-medium">{loadingMessage}</span>
          </div>
        )}

        {/* Theme Explorer - 3D Cosmic Neural Bloom */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span className="text-cyan-400">✦</span> 选择探索领域
          </h2>
          <ThemeExplorer
            selectedTopic={selectedTopic}
            onTopicChange={(topic) => {
              setSelectedTopic(topic);
              // Find the domain that contains this topic
              for (const domain of themeDomains) {
                const subTheme = domain.subThemes.find(st => st.topics.includes(topic));
                if (subTheme) {
                  setSelectedDomain(domain);
                  setExpandedSubTheme(subTheme.id);
                  // Auto-generate story when topic is selected
                  setTimeout(() => {
                    generateStory(topic, age, mode, minutes, true);
                  }, 500);
                  break;
                }
              }
            }}
          />
        </div>

        {/* Sub Themes - Expanded View */}
        {selectedDomain && (
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden mb-6">
            <div
              className="px-4 py-3 flex items-center gap-3 border-b border-slate-800"
              style={{ borderColor: `${selectedDomain.color}40` }}
            >
              <span className="text-2xl">{selectedDomain.icon}</span>
              <span className="font-semibold text-slate-200">{selectedDomain.name}</span>
              <button
                onClick={() => {
                  setSelectedDomain(null);
                  setExpandedSubTheme(null);
                }}
                className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-slate-400 mb-4">选择一个子主题开始探索：</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedDomain.subThemes.map((subTheme) => (
                  <button
                    key={subTheme.id}
                    onClick={() => handleSubThemeClick(subTheme.id)}
                    disabled={isLoading}
                    className={`
                      group relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200
                      ${expandedSubTheme === subTheme.id
                        ? 'bg-slate-800/80 border-cyan-500/50'
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-all
                      ${expandedSubTheme === subTheme.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                      }
                    `}>
                      {expandedSubTheme === subTheme.id ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-slate-200 font-medium">{subTheme.name}</span>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              {/* Generate button */}
              {expandedSubTheme && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleGenerateFromSubTheme(expandedSubTheme)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FE6845] via-[#FF8C42] to-[#FFB347] text-white py-3 px-6 rounded-xl font-bold hover:from-[#E85A3A] hover:via-[#FF7A30] hover:to-[#FFA030] disabled:opacity-50 transition-all shadow-lg"
                    style={{ boxShadow: '0 0 20px -5px rgba(254, 104, 69, 0.5)' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        探索中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        生成故事
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        <div className="mb-6">
          <HistoryList items={localHistory} onSelect={handleHistorySelect} />
        </div>

        {/* Decorative footer */}
        <div className="text-center text-xs text-slate-600 py-4">
          <p>✨ {profile.name}的探索之旅</p>
        </div>
      </div>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <ProfileEditor
          profile={profile}
          onSave={(updatedProfile) => {
            onProfileUpdate(updatedProfile);
            setShowProfileEditor(false);
          }}
          onClose={() => setShowProfileEditor(false)}
        />
      )}
    </div>
  );
}
