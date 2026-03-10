/**
 * Cache utilities for API cost optimization
 */

import { SkillTreeData } from '../types';

const CACHE_PREFIX = 'ai_horizon_cache_';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_COUNTER_KEY = 'ai_horizon_api_calls';
const API_COUNTER_DATE_KEY = 'ai_horizon_api_date';

/** Normalize topic for cache key */
function getCacheKey(topic: string, variation: number): string {
  const normalized = topic.trim().toLowerCase().replace(/\s+/g, '_');
  return `${CACHE_PREFIX}${normalized}_v${variation}`;
}

export interface CacheResult {
  data: SkillTreeData;
  fromCache: boolean;
}

/** Get cached result if valid */
export function getCachedResult(topic: string, variation: number): SkillTreeData | null {
  try {
    const key = getCacheKey(topic, variation);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { data: SkillTreeData; timestamp: number };
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/** Save result to cache */
export function setCachedResult(topic: string, variation: number, data: SkillTreeData): void {
  try {
    const key = getCacheKey(topic, variation);
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore quota exceeded or other storage errors
  }
}

/** Increment API call counter (call only on actual API request) */
export function incrementApiCallCount(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem(API_COUNTER_DATE_KEY);
    const storedCount = localStorage.getItem(API_COUNTER_KEY);

    let count = 0;
    if (storedDate === today && storedCount) {
      count = parseInt(storedCount, 10) || 0;
    }

    count += 1;
    localStorage.setItem(API_COUNTER_KEY, String(count));
    localStorage.setItem(API_COUNTER_DATE_KEY, today);
    return count;
  } catch {
    return 0;
  }
}

/** Get current API call count for today */
export function getApiCallCount(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem(API_COUNTER_DATE_KEY);
    const storedCount = localStorage.getItem(API_COUNTER_KEY);

    if (storedDate !== today || !storedCount) return 0;
    return parseInt(storedCount, 10) || 0;
  } catch {
    return 0;
  }
}
