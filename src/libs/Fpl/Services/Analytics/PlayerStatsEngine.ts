/**
 * Player Stats Engine - Advanced player statistics with fixture-weighted trimean analysis
 * Contains the "Secret Sauce" - Tukey's Trimean with opponent difficulty weighting
 *
 * Key Innovation: Context-aware performance metrics that account for opponent strength
 * Points against difficult opponents (e.g., Man City) are weighted higher than points
 * against weaker opponents, providing a more accurate measure of player quality.
 */

import {
  getElementSummary,
} from '../../Data/Client/FPLApiClient';
import {
  getBootstrapEvents,
  getBootstrapTeams,
  getBootstrapElements,
} from '../../Data/Client/BootstrapClient';
import pLimit from 'p-limit';
import { cacheLife, cacheTag } from 'next/cache';
import { calculateTrimean, calculateMedian } from '../../Utils/MathUtils';
import type { PlayerStatSummary } from '../../Types';

const limit = pLimit(5);

/**
 * Fetch individual player stats with fixture-weighted trimean calculation
 * Uses Next.js 'use cache' instead of in-memory caching
 */
async function getPlayerStats(elementId: number) {
  'use cache'
  cacheTag('player-stats', `element-${elementId}`);
  cacheLife('gameweek');

  try {
    const summary = await getElementSummary(elementId);
    // Only include gameweeks where the player actually played (minutes > 0)
    // AND only the last 12 gameweeks to prevent stale data bias
    const validHistory = summary.history
      .filter((gw: any) => gw.minutes > 0);

    const recentHistory = validHistory.slice(-12); // Last 12 appearances

    // Context Blindness Fix: Weight points by opponent difficulty
    // Points against strong opponents (High difficulty) are worth more
    // Points against weak opponents (Low difficulty) are worth less
    const weightedGameweekPoints = recentHistory.map((gw: any) => {
       // Difficulty is usually 1-5.
       // We want to reward performance in hard games.
       // Standardize: 3 is neutral.
       // Factor: 1 + (Difficulty - 3) * 0.1
       // Difficulty 5 (Man City) -> 1.2 multiplier
       // Difficulty 1 (Easy) -> 0.8 multiplier
       const difficulty = gw.difficulty || 3;
       const multiplier = 1 + (difficulty - 3) * 0.1;
       return gw.total_points * multiplier;
    });

    return {
      median: calculateMedian(weightedGameweekPoints),
      trimean: calculateTrimean(weightedGameweekPoints),
    };
  } catch (error) {
    console.error(`Failed to fetch history for player ${elementId}:`, error);
    return { median: 0, trimean: 0 };
  }
}

function getPositionName(elementType: number): string {
  switch (elementType) {
    case 1: return 'GKP';
    case 2: return 'DEF';
    case 3: return 'MID';
    case 4: return 'FWD';
    default: return 'MID';
  }
}

/**
 * Get aggregated player statistics with real Tukey's Trimean
 */
export async function getPlayerStatsAggregate(elementIds?: number[], limit_count?: number, offset?: number) {
  'use cache'
  cacheTag('player-stats-aggregate');
  cacheLife('gameweek');

  const [events, teams, elements] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapTeams(),
    getBootstrapElements(),
  ]);

  // If no elementIds provided, return all active players sorted by total points
  let idsToProcess = elementIds || elements
    .filter((el: any) => el.status !== 'u' && el.status !== 'n') // Only active/available players
    .sort((a: any, b: any) => b.total_points - a.total_points)
    .map((el: any) => el.id);

  const totalCount = idsToProcess.length;

  // Apply pagination if specified
  if (limit_count !== undefined) {
    const start = offset || 0;
    idsToProcess = idsToProcess.slice(start, start + limit_count);
  }

  // Fetch historical data for all players in parallel
  // Next.js 'use cache' in getPlayerStats handles per-player caching
  const playerStats = await Promise.all(
    idsToProcess.map((id: number) => limit(async () => {
      const stats = await getPlayerStats(id);
      return { id, ...stats };
    }))
  );

  // Build stats map for quick lookup
  const statsMap = new Map(playerStats.map(s => [s.id, s]));

  return {
    players: idsToProcess.map((elementId: number) => {
      const element = elements.find((el: any) => el.id === elementId);
      if (!element) return null;

      const team = teams.find((t: any) => t.id === element.team);
      const pointsPerGame = parseFloat(element.points_per_game) || 0;
      const stats = statsMap.get(elementId);

      return {
        id: element.id,
        webName: element.web_name,
        teamId: team?.id || 0,
        teamName: team?.name || '',
        teamShortName: team?.short_name || '',
        position: getPositionName(element.element_type),
        cost: element.now_cost / 10,
        totalPoints: element.total_points,
        averagePoints: pointsPerGame,
        medianPoints: (stats?.median !== undefined && !Number.isNaN(stats.median)) ? stats.median : pointsPerGame,
        trimean: (stats?.trimean !== undefined && !Number.isNaN(stats.trimean)) ? stats.trimean : pointsPerGame,
        lastGwPoints: element.event_points || 0,
        matchesPlayed: element.minutes > 0 ? Math.floor(element.minutes / 90) : 0,
        injuryStatus: element.news || null,
        status: element.status, // 'a' = available, 'i' = injured, etc.
      };
    }).filter(Boolean) as PlayerStatSummary[],
    totalCount
  };
}
