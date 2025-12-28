/**
 * Bootstrap data client with split endpoints for optimal caching
 *
 * The full bootstrap-static endpoint returns ~2.4MB which exceeds Next.js 2MB cache limit.
 * This module splits the response into separately cacheable components:
 * - Events (gameweeks): ~2KB, changes frequently during active gameweek
 * - Teams: ~8KB, rarely changes
 * - Elements (players): ~2.39MB, changes frequently with player stats
 */

import { cacheLife, cacheTag } from 'next/cache';
import type {
  BootstrapStatic,
  BootstrapEvent,
  BootstrapTeam,
  BootstrapElement,
} from '../../Types/BootstrapTypes';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';
const USER_AGENT = 'Mozilla/5.0 (compatible; FPLAlchemy/1.0)';

/**
 * Internal fetch helper for bootstrap data
 */
async function fetchBootstrapStatic(): Promise<BootstrapStatic> {
  const url = `${FPL_API_BASE}/bootstrap-static/`;

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get gameweek/event data
 * Cache: 1 minute during active gameweek (changes with deadline, current status)
 */
export const getBootstrapEvents = async (): Promise<BootstrapEvent[]> => {
  'use cache';
  cacheTag('bootstrap', 'events');
  cacheLife('gameweek');

  const data = await fetchBootstrapStatic();
  return data.events;
};

/**
 * Get team data
 * Cache: 1 hour (rarely changes - only with team stats updates)
 */
export const getBootstrapTeams = async (): Promise<BootstrapTeam[]> => {
  'use cache';
  cacheTag('bootstrap', 'teams');
  cacheLife('static');

  const data = await fetchBootstrapStatic();
  return data.teams;
};

/**
 * Get player/element data
 * Cache: 1 minute during active gameweek (changes with transfers, price changes, stats)
 */
export const getBootstrapElements = async (): Promise<BootstrapElement[]> => {
  'use cache';
  cacheTag('bootstrap', 'elements');
  cacheLife('gameweek');

  const data = await fetchBootstrapStatic();
  return data.elements;
};

/**
 * Get full bootstrap data
 * Use this sparingly - prefer split endpoints above for better caching
 * No cache directive to avoid 2MB limit conflict
 */
export const getBootstrapStatic = async (): Promise<BootstrapStatic> => {
  return fetchBootstrapStatic();
};
