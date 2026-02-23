'use client';

import { useState, useEffect } from 'react';
import { StoryMode, Age, Topic, Duration, HistoryItem, CachedStory, Story } from '@/types';
import { BedtimeResult } from '@/components/BedtimeResult';
import { ReadingResult } from '@/components/ReadingResult';
import { CosmicVoid } from '@/components/CosmicVoid';
import { ExplorerOnboarding, loadProfile } from '@/components/ExplorerOnboarding';
import { SpaceExplorer } from '@/components/SpaceExplorer';
import type { ExplorerProfile } from '@/components/ExplorerOnboarding';
import { RefreshCw, Rocket } from 'lucide-react';

// Fun loading messages
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
const API_COUNT_KEY = 'stem_story_api_count';
const API_DATE_KEY = 'stem_story_api_date';

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

function getApiCountFromStorage(): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(API_DATE_KEY);
  if (storedDate !== today) {
    localStorage.setItem(API_DATE_KEY, today);
    localStorage.setItem(API_COUNT_KEY, '0');
    return 0;
  }
  const count = localStorage.getItem(API_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

function incrementApiCount() {
  if (typeof window === 'undefined') return;
  const count = getApiCountFromStorage();
  localStorage.setItem(API_COUNT_KEY, String(count + 1));
}

export default function Home() {
  // Hydration 修复：客户端渲染标记
  const [isClient, setIsClient] = useState(false);

  // Explorer profile state
  const [profile, setProfile] = useState<ExplorerProfile | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const [mode, setMode] = useState<StoryMode>('bedtime');
  const [age, setAge] = useState<Age>(8);
  const [topic, setTopic] = useState<Topic>('airplane');
  const [minutes, setMinutes] = useState<Duration>(10);
  const [explorerName, setExplorerName] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('正在准备魔法...');
  const [error, setError] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [apiCount, setApiCount] = useState(0);

  // Load profile and history
  useEffect(() => {
    setIsClient(true);
    const savedProfile = loadProfile();
    setProfile(savedProfile);
    if (savedProfile) {
      setExplorerName(savedProfile.name);
      setAge(savedProfile.age as Age);
    }
    setHistory(loadHistory());
    setApiCount(getApiCountFromStorage());
  }, []);

  // Handle profile completion
  const handleProfileComplete = (newProfile: ExplorerProfile) => {
    setProfile(newProfile);
    setExplorerName(newProfile.name);
    setAge(newProfile.age as Age);
  };

  // Handle profile update
  const handleProfileUpdate = (updatedProfile: ExplorerProfile) => {
    setProfile(updatedProfile);
    setExplorerName(updatedProfile.name);
    setAge(updatedProfile.age as Age);
  };

  // Show onboarding if no profile
  if (isClient && !profile) {
    return <ExplorerOnboarding onComplete={handleProfileComplete} />;
  }

  // Show SpaceExplorer when profile exists and no story is displayed
  const handleStoryGenerated = (story: Story, storyMode: StoryMode) => {
    setCurrentStory(story);
    setMode(storyMode);
  };

  const generateStory = async (
    targetTopic: Topic,
    targetAge: Age,
    targetMode: StoryMode,
    targetMinutes: Duration,
    targetExplorerName: string,
    forceGenerate: boolean = false
  ) => {
    const cacheKey = getCacheKey(targetMode, targetAge, targetTopic, targetMinutes);
    console.log('CacheKey:', cacheKey);

    if (!forceGenerate) {
      const cached = loadCachedStory(cacheKey);
      if (cached) {
        console.log('✓ Using cached story');
        setCurrentStory(cached.story);
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          key: cacheKey,
          mode: targetMode,
          title: cached.story.title,
          topic: targetTopic,
          timestamp: Date.now(),
        };
        const newHistory = [newHistoryItem, ...history].slice(0, 3);
        setHistory(newHistory);
        saveHistory(newHistory);
        return;
      }
      console.log('✗ Cache miss');
    } else {
      console.log('✗ Force generate, skipping cache');
    }

    const currentCount = getApiCountFromStorage();
    if (currentCount >= 100) {
      setError('今日API调用次数已用完（每天100次），请查看历史记录或明天再来！');
      return;
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
          explorer_name: targetExplorerName,
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

      incrementApiCount();
      setApiCount(prev => prev + 1);

      console.log('>>> Setting current story:', story.title);
      setCurrentStory(story);

      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        key: cacheKey,
        mode: targetMode,
        title: story.title,
        topic: targetTopic,
        timestamp: Date.now(),
      };
      const newHistory = [newHistoryItem, ...history].slice(0, 3);
      setHistory(newHistory);
      saveHistory(newHistory);

      console.log('✓ Story generated:', story.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    generateStory(topic, age, mode, minutes, explorerName, false);
  };

  const handleRefresh = () => {
    generateStory(topic, age, mode, minutes, explorerName, true);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    const cached = loadCachedStory(item.key);
    if (cached) {
      setCurrentStory(cached.story);
      setMode(cached.mode);
    }
  };

  const handleBack = () => {
    setCurrentStory(null);
  };

  // 非客户端时返回占位符
  if (!isClient) {
    return (
      <>
        <CosmicVoid />
        <div className="min-h-screen py-8 px-4 flex items-center justify-center">
          <div className="animate-pulse text-slate-500">加载中...</div>
        </div>
      </>
    );
  }

  // 显示结果页
  if (currentStory) {
    return mode === 'bedtime' ? (
      <BedtimeResult
        story={currentStory as any}
        onBack={handleBack}
        onRegenerate={handleRefresh}
        isLoading={isLoading}
      />
    ) : (
      <ReadingResult
        story={currentStory as any}
        onBack={handleBack}
        onRegenerate={handleRefresh}
        isLoading={isLoading}
      />
    );
  }

  return (
    <>
      <CosmicVoid />
      {/* Show SpaceExplorer when profile exists */}
      <SpaceExplorer
        profile={profile!}
        onProfileUpdate={handleProfileUpdate}
        onStoryGenerated={handleStoryGenerated}
        history={history}
        initialAge={age}
        initialMode={mode}
      />
    </>
  );
}
