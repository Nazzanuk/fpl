'use server'

import { revalidateTag as revalidateTagImport } from 'next/cache';

const revalidateTag = revalidateTagImport as any;

/**
 * Invalidate all gameweek-related cache
 * Called when gameweek transitions or significant updates occur
 */
export async function invalidateGameweekCache() {
  revalidateTag('gameweek-data');
  revalidateTag('live-scores');
  revalidateTag('live-table');
  revalidateTag('gw-status');
  revalidateTag('player-stats-aggregate');
}

/**
 * Invalidate cache for a specific league
 */
export async function invalidateLeagueCache(leagueId: number) {
  revalidateTag(`league-${leagueId}`);
  revalidateTag('live-table'); // Often related to league ID
}

/**
 * Invalidate cache for a specific manager
 */
export async function invalidateManagerCache(managerId: number) {
  revalidateTag(`manager-${managerId}`);
  revalidateTag('manager-picks');
  revalidateTag('manager-history');
  revalidateTag('manager-history-data');
  revalidateTag('recommendations');
}

/**
 * Full refresh for static bootstrap data
 */
export async function invalidateStaticCache() {
  revalidateTag('bootstrap');
  revalidateTag('best-xi');
  revalidateTag('fixtures-all');
}
