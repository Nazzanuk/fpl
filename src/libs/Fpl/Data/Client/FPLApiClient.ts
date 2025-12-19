/**
 * FPL API Client - Low-level API fetching with caching
 * Following CLAUDE.md specification: 60s revalidation, User-Agent spoofing
 */

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';
const USER_AGENT = 'Mozilla/5.0 (compatible; FPLLive/1.0)';

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
 */
export async function getBootstrapStatic() {
  return fplFetch<any>('/bootstrap-static/');
}

/**
 * League standings and manager list
 */
export async function getLeagueManagers(leagueId: number) {
  return fplFetch<any>(`/leagues-classic/${leagueId}/standings/`);
}

/**
 * Manager's picks for a specific gameweek
 */
export async function getManagerPicks(entryId: number, eventId: number) {
  return fplFetch<any>(`/entry/${entryId}/event/${eventId}/picks/`);
}

/**
 * Manager's history (all gameweeks)
 */
export async function getManagerHistory(entryId: number) {
  return fplFetch<any>(`/entry/${entryId}/history/`);
}

/**
 * Live gameweek data (real-time player scores)
 */
export async function getEventLive(eventId: number) {
  return fplFetch<any>(`/event/${eventId}/live/`, 30); // 30s cache for live data
}

/**
 * Fixtures for a specific gameweek
 */
export async function getFixtures(eventId: number) {
  return fplFetch<any>(`/fixtures/?event=${eventId}`);
}

/**
 * All fixtures (all gameweeks)
 */
export async function getAllFixtures() {
  return fplFetch<any>('/fixtures/');
}

/**
 * Player element summary (detailed player stats)
 */
export async function getElementSummary(elementId: number) {
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
