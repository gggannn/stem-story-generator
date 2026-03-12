'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryMode, Age, Topic, Duration, HistoryItem, CachedStory, Story, StorageKey, BedtimeStory, ReadingStory } from '@/types';
import { BedtimeResult } from '@/components/BedtimeResult';
import { ReadingResult } from '@/components/ReadingResult';
import { CosmicVoid } from '@/components/CosmicVoid';
import { ExplorerOnboarding, loadProfile, ProfileEditor } from '@/components/ExplorerOnboarding';
import { Dashboard } from '@/components/Dashboard';
import type { ExplorerProfile } from '@/components/ExplorerOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { getUserId, loadFromStorage, saveToStorage, loadCachedStory, saveCachedStory } from '@/lib/storage';
import { Rocket } from 'lucide-react';
import { LOADING_MESSAGES } from '@/constants/topics';

const loadingMessages = LOADING_MESSAGES;

// Storage keys
const HISTORY_KEY: StorageKey = 'stem_story_history';
const CACHE_PREFIX: StorageKey = 'stem_story_cache';
const API_COUNT_KEY: StorageKey = 'stem_story_api_count';
const API_DATE_KEY: StorageKey = 'stem_story_api_date';

function getCacheKey(mode: StoryMode, age: Age, topic: Topic, minutes: Duration, identity?: string): string {
  const suffix = mode === 'bedtime' ? minutes : 'A4';
  const identityPart = identity || 'explorer';
  return `${mode}|${age}|${topic}|${suffix}|${identityPart}|zh`;
}

function loadHistory(userId: string | null): HistoryItem[] {
  return loadFromStorage(HISTORY_KEY, userId, []);
}

function saveHistory(items: HistoryItem[], userId: string | null) {
  saveToStorage(HISTORY_KEY, userId, items.slice(0, 3));
}

function loadUserCachedStory(key: string, userId: string | null): CachedStory | null {
  return loadCachedStory(key, userId);
}

function saveUserCachedStory(cachedStory: CachedStory, userId: string | null): void {
  saveCachedStory(cachedStory, userId);
}

function getApiCountFromStorage(userId: string | null): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date().toDateString();
  const storedDate = loadFromStorage(API_DATE_KEY, userId, null);
  if (storedDate !== today) {
    saveToStorage(API_DATE_KEY, userId, today);
    saveToStorage(API_COUNT_KEY, userId, 0);
    return 0;
  }
  return loadFromStorage(API_COUNT_KEY, userId, 0);
}

function incrementApiCount(userId: string | null) {
  if (typeof window === 'undefined') return;
  const count = getApiCountFromStorage(userId);
  saveToStorage(API_COUNT_KEY, userId, count + 1);
}

export default function Home() {
  const { logout, isLoading: authLoading } = useAuth();

  // Hydration 修复：客户端渲染标记
  const [isClient, setIsClient] = useState(false);

  // Explorer profile state
  const [profile, setProfile] = useState<ExplorerProfile | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const [mode, setMode] = useState<StoryMode>('bedtime');
  const [age, setAge] = useState<Age>(8);
  const [explorerName, setExplorerName] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('正在准备魔法...');
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [, setApiCount] = useState(0);
  const [, setError] = useState<string | null>(null);

  // Get current user ID
  const userId = getUserId();

  // Load profile and history
  useEffect(() => {
    setIsClient(true);
    const savedProfile = loadProfile();
    setProfile(savedProfile);
    if (savedProfile) {
      setExplorerName(savedProfile.name);
      setAge(savedProfile.age as Age);
    }
    setHistory(loadHistory(userId));
    setApiCount(getApiCountFromStorage(userId));
  }, [userId]);

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
    return (
      <>
        <CosmicVoid />
        <ExplorerOnboarding onComplete={handleProfileComplete} />
      </>
    );
  }

  const handleDashboardGenerate = (targetMode: StoryMode, targetAge: Age, targetTopic: Topic, targetMinutes?: number) => {
    const duration = targetMinutes || 10;
    generateStory(targetTopic, targetAge, targetMode, duration as Duration, explorerName, false);
  };

  const handleLogout = () => {
    logout();
    setProfile(null);
    setCurrentStory(null);
  };

  const handleEditProfile = () => {
    setShowProfileEditor(true);
  };

  const handleProfileEditorClose = () => {
    setShowProfileEditor(false);
  };

  const generateStory = async (
    targetTopic: Topic,
    targetAge: Age,
    targetMode: StoryMode,
    targetMinutes: Duration,
    targetExplorerName: string,
    forceGenerate: boolean = false
  ) => {
    const targetIdentity = profile?.identity || 'explorer';
    const cacheKey = getCacheKey(targetMode, targetAge, targetTopic, targetMinutes, targetIdentity);
    console.log('CacheKey:', cacheKey);

    if (!forceGenerate) {
      const cached = loadUserCachedStory(cacheKey, userId);
      if (cached) {
        console.log('✓ Using cached story');
        setCurrentStory(cached.story);
        setMode(targetMode);
        const newHistoryItem: HistoryItem = {
          id: crypto.randomUUID(),
          key: cacheKey,
          mode: targetMode,
          title: cached.story.title,
          topic: targetTopic,
          age: targetAge,
          timestamp: Date.now(),
        };
        const newHistory = [newHistoryItem, ...history].slice(0, 3);
        setHistory(newHistory);
        saveHistory(newHistory, userId);
        return;
      }
      console.log('✗ Cache miss');
    } else {
      console.log('✗ Force generate, skipping cache');
    }

    const currentCount = getApiCountFromStorage(userId);
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
          identity: targetIdentity,
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
      saveUserCachedStory(cachedStory, userId);

      incrementApiCount(userId);
      setApiCount(prev => prev + 1);

      console.log('>>> Setting current story:', story.title);
      setCurrentStory(story);
      setMode(targetMode);

      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        key: cacheKey,
        mode: targetMode,
        title: story.title,
        topic: targetTopic,
        age: targetAge,
        timestamp: Date.now(),
      };
      const newHistory = [newHistoryItem, ...history].slice(0, 3);
      setHistory(newHistory);
      saveHistory(newHistory, userId);

      console.log('✓ Story generated:', story.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (!currentStory) return;
    const historyItem = history.find(h => h.title === currentStory.title);
    if (historyItem) {
      generateStory(historyItem.topic, historyItem.age, historyItem.mode, 10, explorerName, true);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    const cached = loadUserCachedStory(item.key, userId);
    if (cached) {
      setCurrentStory(cached.story);
      setMode(cached.mode);
    }
  };

  const handleBack = () => {
    setCurrentStory(null);
  };

  // 非客户端时返回占位符
  if (!isClient || authLoading) {
    return (
      <>
        <CosmicVoid />
        <div className="min-h-screen py-8 px-4 flex items-center justify-center">
          <div className="animate-pulse text-slate-500">加载中...</div>
        </div>
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <CosmicVoid />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto rounded-full border-4 border-indigo-500/20 border-t-indigo-500"
            />
            <Rocket className="w-12 h-12 mx-auto text-indigo-400" />
            <p className="text-xl font-medium">{loadingMessage}</p>
          </motion.div>
        </div>
      </>
    );
  }

  // 显示结果页
  if (currentStory) {
    return (
      <>
        <CosmicVoid />
        <AnimatePresence mode="wait">
          {mode === 'bedtime' ? (
            <motion.div
              key="bedtime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BedtimeResult
                story={currentStory as BedtimeStory}
                onBack={handleBack}
                onRegenerate={handleRefresh}
                isLoading={isLoading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReadingResult
                story={currentStory as ReadingStory}
                onBack={handleBack}
                onRegenerate={handleRefresh}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <CosmicVoid />
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Dashboard
            profile={{ name: profile!.name, age: profile!.age as Age, identity: profile!.identity }}
            history={history}
            onGenerate={handleDashboardGenerate}
            onHistoryClick={handleHistorySelect}
            onLogout={handleLogout}
            onEditProfile={handleEditProfile}
          />
        </motion.div>
      </AnimatePresence>
      {showProfileEditor && profile && (
        <ProfileEditor
          profile={profile}
          onSave={handleProfileUpdate}
          onClose={handleProfileEditorClose}
        />
      )}
    </>
  );
}
