'use client';

import React, { useState, useEffect } from 'react';
import { ThemeDomain, Topic, Age, StoryMode, Duration, HistoryItem, CachedStory, Story } from '@/types';
import { themeDomains, getTopicFromSubTheme } from '@/config/theme-config';
import { AgeCapsule } from '@/components/AgeCapsule';
import { ModeToggle } from '@/components/ModeToggle';
import { DurationCapsule } from '@/components/DurationCapsule';
import { HistoryList } from '@/components/HistoryList';
import { ProfileEditor, loadProfile } from '@/components/ExplorerOnboarding';
import type { ExplorerProfile } from '@/components/ExplorerOnboarding';
import { Sparkles, RefreshCw, Loader2, Rocket, ChevronDown, ChevronRight, X } from 'lucide-react';

// Loading messages
const loadingMessages = [
  '正在联络外星科学家...',
  '正在组装有趣的故事...',
  '正在收集科学知识...',
  '正在施放创意魔法...',
  '正在打开知识宝库...',
];

// Storage keys
const HISTORY_KEY = 'stem_story_history';
const CACHE_PREFIX = 'stem_story_cache_';

function getCacheKey(mode: StoryMode, age: Age, topic: Topic, minutes: Duration): string {
  const suffix = mode === 'bedtime' ? minutes : 'A4';
  return `${mode}|${age}|${topic}|${suffix}|zh`;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 3)));
}

function loadCachedStory(key: string): CachedStory | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CACHE_PREFIX + key);
  if (!stored) return null;
  try {
    const cached: CachedStory = JSON.parse(stored);
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    if (now - cached.timestamp > hours24) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

interface SpaceExplorerProps {
  profile: ExplorerProfile;
  onProfileUpdate: (profile: ExplorerProfile) => void;
  onStoryGenerated: (story: Story, mode: StoryMode) => void;
  history: HistoryItem[];
  initialAge?: Age;
  initialMode?: StoryMode;
}

export function SpaceExplorer({
  profile,
  onProfileUpdate,
  onStoryGenerated,
  history,
  initialAge,
  initialMode,
}: SpaceExplorerProps) {
  const [selectedDomain, setSelectedDomain] = useState<ThemeDomain | null>(null);
  const [expandedSubTheme, setExpandedSubTheme] = useState<string | null>(null);
  const [age, setAge] = useState<Age>(initialAge || (profile.age as Age) || 8);
  const [mode, setMode] = useState<StoryMode>(initialMode || 'bedtime');
  const [minutes, setMinutes] = useState<Duration>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('正在准备魔法...');
  const [error, setError] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>(history);

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
      const cached = loadCachedStory(cacheKey);
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
          saveHistory(newHistory);
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
      localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(cachedStory));

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
        saveHistory(newHistory);
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

    generateStory(topic, age, mode, minutes, false);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    const cached = loadCachedStory(item.key);
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚀</div>
            <h1 className="text-xl font-bold text-slate-200">STEM 宇宙探索器</h1>
          </div>
          <button
            onClick={() => setShowProfileEditor(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
          >
            <span className="text-lg">👤</span>
            <span className="font-medium">{profile.name}</span>
          </button>
        </div>

        {/* Quick Settings Bar */}
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-800 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">探险者年龄</label>
                <AgeCapsule selected={age} onChange={setAge} compact />
              </div>
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

        {/* Theme Domains Grid */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span className="text-cyan-400">✦</span> 选择探索领域
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {themeDomains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => handleDomainClick(domain)}
                className={`
                  relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300
                  ${selectedDomain?.id === domain.id
                    ? 'bg-slate-800/80 border-2 scale-105'
                    : 'bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 hover:scale-102'
                  }
                `}
                style={{
                  boxShadow: selectedDomain?.id === domain.id
                    ? `0 0 20px ${domain.color}40`
                    : 'none',
                  borderColor: selectedDomain?.id === domain.id ? domain.color : undefined,
                }}
              >
                <span className="text-2xl mb-1">{domain.icon}</span>
                <span className="text-xs text-slate-300 font-medium">{domain.name}</span>
                {selectedDomain?.id === domain.id && (
                  <div
                    className="absolute inset-0 rounded-xl opacity-20"
                    style={{ background: domain.color }}
                  />
                )}
              </button>
            ))}
          </div>
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
