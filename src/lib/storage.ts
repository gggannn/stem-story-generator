import type { StorageKey } from '@/types';

// Get current user ID from localStorage (client-side only)
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('current_user_id');
}

// Set current user ID (client-side only)
export function setUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('current_user_id', userId);
}

// Clear current user ID (client-side only)
export function clearUserId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('current_user_id');
}

// Generate storage key with user isolation
export function getStorageKey(baseKey: StorageKey, userId: string | null): string {
  if (!userId) return baseKey;
  return `${baseKey}_${userId}`;
}

// Client-side storage helpers (for use in components)
export function loadFromStorage<T>(key: StorageKey, userId: string | null, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const storageKey = getStorageKey(key, userId);
  const stored = localStorage.getItem(storageKey);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: StorageKey, userId: string | null, value: T): void {
  if (typeof window === 'undefined') return;
  const storageKey = getStorageKey(key, userId);
  localStorage.setItem(storageKey, JSON.stringify(value));
}

export function removeFromStorage(key: StorageKey, userId: string | null): void {
  if (typeof window === 'undefined') return;
  const storageKey = getStorageKey(key, userId);
  localStorage.removeItem(storageKey);
}

// Cache prefix helper
export function getCacheKey(mode: string, age: number, topic: string, minutes: number | string): string {
  const suffix = mode === 'bedtime' ? minutes : 'A4';
  return `${mode}|${age}|${topic}|${suffix}|zh`;
}

export function loadCachedStory(key: string, userId: string | null) {
  const CACHE_PREFIX = 'stem_story_cache_';
  if (typeof window === 'undefined') return null;
  const storageKey = userId ? `${CACHE_PREFIX}${userId}_${key}` : `${CACHE_PREFIX}${key}`;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;
  try {
    const cached = JSON.parse(stored);
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    if (now - cached.timestamp > hours24) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export function saveCachedStory(cachedStory: any, userId: string | null): void {
  const CACHE_PREFIX = 'stem_story_cache_';
  if (typeof window === 'undefined') return;
  const storageKey = userId ? `${CACHE_PREFIX}${userId}_${cachedStory.key}` : `${CACHE_PREFIX}${cachedStory.key}`;
  localStorage.setItem(storageKey, JSON.stringify(cachedStory));
}
