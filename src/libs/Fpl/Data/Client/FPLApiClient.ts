import { cacheLife, cacheTag } from 'next/cache';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';
const USER_AGENT = 'Mozilla/5.0 (compatible; FPLAlchemy/1.0)';

/**
 * Core fetch wrapper with Next.js caching and User-Agent spoofing
 */
async function fplFetch<T>(endpoint: string, revalidate = 60): Promise<T> {
  const url = `${FPL_API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Bootstrap-static data (player/team metadata, current gameweek)
 * Note: This endpoint returns ~2.4MB which exceeds Next.js 2MB cache limit.
 * We use cache: 'no-store' to bypass the problematic internal cache.
 */
export async function getBootstrapStatic() {
  'use cache'
  cacheTag('bootstrap', 'gameweek-data');
  cacheLife('static');

  const url = `${FPL_API_BASE}/bootstrap-static/`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      cache: 'no-store', // Bypass Next.js cache for large responses
    });

    if (!response.ok) {
      throw new Error(`FPL API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch bootstrap-static:', error);
    throw error;
  }
}

/**
 * League standings and manager list
 */
export async function getLeagueManagers(leagueId: number) {
  'use cache'
  cacheTag('league', `league-${leagueId}`);
  cacheLife('gameweek');
  return fplFetch<any>(`/leagues-classic/${leagueId}/standings/`);
}

/**
 * Manager's picks for a specific gameweek
 */
export async function getManagerPicks(entryId: number, eventId: number) {
  'use cache'
  cacheTag('manager-picks', `manager-${entryId}`, `gw-${eventId}`);
  cacheLife('gameweek');
  return fplFetch<any>(`/entry/${entryId}/event/${eventId}/picks/`);
}

/**
 * Manager's history (all gameweeks)
 */
export async function getManagerHistory(entryId: number) {
  'use cache'
  cacheTag('manager-history', `manager-${entryId}`);
  cacheLife('historical');
  return fplFetch<any>(`/entry/${entryId}/history/`);
}

/**
 * Live gameweek data (real-time player scores)
 */
export async function getEventLive(eventId: number) {
  'use cache'
  cacheTag('live-scores', `gw-${eventId}`);
  cacheLife('live');
  return fplFetch<any>(`/event/${eventId}/live/`, 30); // 30s cache for live data
}

/**
 * Fixtures for a specific gameweek
 */
export async function getFixtures(eventId: number) {
  'use cache'
  cacheTag('fixtures', `gw-${eventId}`);
  cacheLife('gameweek');
  return fplFetch<any>(`/fixtures/?event=${eventId}`);
}

/**
 * All fixtures (all gameweeks)
 */
export async function getAllFixtures() {
  'use cache'
  cacheTag('fixtures-all');
  cacheLife('static');
  return fplFetch<any>('/fixtures/');
}

/**
 * Player element summary (detailed player stats)
 */
export async function getElementSummary(elementId: number) {
  'use cache'
  cacheTag('element-summary', `player-${elementId}`);
  cacheLife('historical');
  return fplFetch<any>(`/element-summary/${elementId}/`);
}

/**
 * Manager entry details
 */
export async function getEntry(entryId: number) {
  return fplFetch<any>(`/entry/${entryId}/`);
}

/**
 * Manager transfers
 */
export async function getEntryTransfers(entryId: number) {
  return fplFetch<any>(`/entry/${entryId}/transfers/`);
}
