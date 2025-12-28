/**
 * Best XI Engine - Optimal squad builder
 * Uses greedy algorithm to build best squad based on trimean scores
 */

import { getBootstrapElements } from '../../Data/Client/BootstrapClient';
import { getPlayerStatsAggregate } from '../AnalyticsEngine';

import { cacheLife, cacheTag } from 'next/cache';

/**
 * Helper to convert element_type number to position string
 */
export function getPositionName(elementType: number): string {
  switch (elementType) {
    case 1: return 'GKP';
    case 2: return 'DEF';
    case 3: return 'MID';
    case 4: return 'FWD';
    default: return 'UNK';
  }
}

/**
 * Get best XI based on form and value
 * Uses greedy algorithm to build optimal squad within budget
 */
export async function getBestXI(leagueId: number) {
  'use cache'
  cacheTag('best-xi');
  cacheLife('gameweek' as any);

  const elements = await getBootstrapElements();

  // Identify top candidates by total points and ppg for trimean fetching
  const topTotalIds = elements
    .sort((a: any, b: any) => b.total_points - a.total_points)
    .slice(0, 100)
    .map((el: any) => el.id);

  const topPpgIds = elements
    .filter((el: any) => el.minutes > 90)
    .sort((a: any, b: any) => parseFloat(b.form) - parseFloat(a.form))
    .slice(0, 100)
    .map((el: any) => el.id);

  const idsToProcess = Array.from(new Set([...topTotalIds, ...topPpgIds]));

  // Use existing aggregate service which includes caching and real trimean
  const { players: aggregatedPlayers } = await getPlayerStatsAggregate(idsToProcess);

  // Format into locally required structure
  const candidates = aggregatedPlayers
    .filter((p: any) => p && p.status === 'a')
    .map((p: any) => {
      let positionNumber = 3;
      if (p.position === 'GKP') positionNumber = 1;
      else if (p.position === 'DEF') positionNumber = 2;
      else if (p.position === 'FWD') positionNumber = 4;

      return {
        ...p,
        positionNumber,
      };
    });

  // Pick Absolute Best 15 (Ignoring budget)
  const squad: any[] = [];
  const positionLimits = { 1: 2, 2: 5, 3: 5, 4: 3 };
  const positionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const teamCounts: Record<number, number> = {};

  // Sort by trimean descending
  const sortedPlayers = [...candidates].sort((a, b) => b.trimean - a.trimean);

  for (const player of sortedPlayers) {
    if (squad.length >= 15) break;

    const position = player.positionNumber as 1 | 2 | 3 | 4;
    const teamId = elements.find((e: any) => e.id === player.id)?.team;

    if (!teamId) continue;

    // Constraints: Position full or max 3 per team
    if (positionCounts[position] >= positionLimits[position]) continue;
    if ((teamCounts[teamId] || 0) >= 3) continue;

    squad.push(player);
    positionCounts[position]++;
    teamCounts[teamId] = (teamCounts[teamId] || 0) + 1;
  }

  // Select best 11 from 15 for starting lineup by evaluating multiple formations
  const gks = squad.filter(p => p.position === 'GKP').sort((a, b) => b.trimean - a.trimean);
  const defs = squad.filter(p => p.position === 'DEF').sort((a, b) => b.trimean - a.trimean);
  const mids = squad.filter(p => p.position === 'MID').sort((a, b) => b.trimean - a.trimean);
  const fwds = squad.filter(p => p.position === 'FWD').sort((a, b) => b.trimean - a.trimean);

  const evaluateFormation = (d: number, m: number, f: number) => {
    if (d + m + f !== 10) return null;
    if (defs.length < d || mids.length < m || fwds.length < f || gks.length < 1) return null;

    const starting11 = [
      gks[0],
      ...defs.slice(0, d),
      ...mids.slice(0, m),
      ...fwds.slice(0, f)
    ];

    const totalTrimean = starting11.reduce((sum, p) => sum + p.trimean, 0);
    return { formation: `${d}-${m}-${f}`, starting11, totalTrimean };
  };

  const formations = [
    evaluateFormation(3, 4, 3),
    evaluateFormation(3, 5, 2),
    evaluateFormation(4, 4, 2),
    evaluateFormation(4, 3, 3),
    evaluateFormation(4, 5, 1),
    evaluateFormation(5, 3, 2),
    evaluateFormation(5, 4, 1),
    evaluateFormation(5, 2, 3),
  ].filter(Boolean) as { formation: string, starting11: any[], totalTrimean: number }[];

  const bestOption = formations.sort((a, b) => b.totalTrimean - a.totalTrimean)[0] || {
    formation: '4-4-2',
    starting11: [gks[0], ...defs.slice(0, 4), ...mids.slice(0, 4), ...fwds.slice(0, 1)].filter(Boolean),
    totalTrimean: 0
  };

  return {
    players: squad,
    starting11: bestOption.starting11,
    totalPoints: squad.reduce((sum, p) => sum + p.totalPoints, 0),
    totalValue: squad.reduce((sum, p) => sum + (p.trimean * 10), 0), // Arbitrary value based on trimean
    totalCost: squad.reduce((sum, p) => sum + p.cost, 0),
    totalTrimean: bestOption.totalTrimean,
    formation: bestOption.formation,
  };
}
