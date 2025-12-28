/**
 * Transfer Engine - Transfer recommendations and squad optimization
 * Analyzes manager's squad and suggests upgrades based on trimean and fixture difficulty
 */

import {
  getManagerPicks,
  getAllFixtures,
} from '../../Data/Client/FPLApiClient';
import {
  getBootstrapEvents,
  getBootstrapElements,
} from '../../Data/Client/BootstrapClient';
import { getPlayerStatsAggregate } from '../AnalyticsEngine';

import { cacheLife, cacheTag } from 'next/cache';

/**
 * Get transfer recommendations for a manager
 * Compares current squad to optimal alternatives with fixture difficulty analysis
 */
export async function getTransferRecommendations(managerId: number) {
  'use cache'
  cacheTag('recommendations', `manager-${managerId}`);
  cacheLife('gameweek' as any);

  const [events, elements] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapElements(),
  ]);

  const currentEvent = events.find((e: any) => e.is_current);

  if (!currentEvent) {
    return [];
  }

  // 1. Get manager picks
  let currentPicks: any;
  try {
    currentPicks = await getManagerPicks(managerId, currentEvent.id);
  } catch (error) {
    console.error(`Failed to get picks for manager ${managerId}:`, error);
    return [];
  }

  // 2. Fetch all required player stats (Manager's team + Potential upgrades)
  const managerPlayerIds = currentPicks.picks.map((p: any) => p.element);

  // Heuristic for potential upgrades: top players by current form
  const { players: topPlayers } = await getPlayerStatsAggregate();
  const { players: managerPlayers } = await getPlayerStatsAggregate(managerPlayerIds);

  // All candidates for evaluation (deduplicated)
  const allCandidates = Array.from(
    new Map([...topPlayers, ...managerPlayers].filter(Boolean).map(p => [p.id, p])).values()
  ).filter((p: any) => p.status === 'a');

  const managerSquad = managerPlayers.filter(Boolean);
  const bankBalance = (currentPicks.entry_history?.bank || 0) / 10;

  // 3. Analyze Fixtures (Next 3)
  const allFixtures = await getAllFixtures();
  const nextThreeGWs = [currentEvent.id, currentEvent.id + 1, currentEvent.id + 2];
  const teamFDR = new Map<number, { avg: number; count: number }>();

  allFixtures.forEach((f: any) => {
    if (nextThreeGWs.includes(f.event)) {
      [{ t: f.team_h, d: f.team_h_difficulty }, { t: f.team_a, d: f.team_a_difficulty }].forEach(side => {
        if (!teamFDR.has(side.t)) teamFDR.set(side.t, { avg: 0, count: 0 });
        const data = teamFDR.get(side.t)!;
        data.avg += side.d;
        data.count += 1;
      });
    }
  });

  const getAvgFDR = (teamId: number) => {
    const data = teamFDR.get(teamId);
    return data && data.count > 0 ? data.avg / data.count : 3.0;
  };

  // 4. Generate Recommendations
  const recommendations: any[] = [];

  for (const current of managerSquad) {
    const outFDR = getAvgFDR(elements.find((e: any) => e.id === current.id)?.team || 0);

    // Get the actual selling price for this player
    // Note: FPL API picks usually have 'selling_price'
    const currentPick = currentPicks.picks?.find((p: any) => p.element === current.id);
    const sellingPrice = currentPick?.selling_price || (current.cost * 10);

    // Bank is in raw FPL units (e.g. 5 means £0.5m)
    const bankRaw = currentPicks.entry_history?.bank || 0;
    const totalBudget = bankRaw + (sellingPrice || 0);

    // Filter alternatives that fit in budget
    // RELAXED: allow up to £50.0m over budget as requested (effectively budget blind)
    const alternatives = allCandidates.filter(alt =>
      alt.position === current.position &&
      alt.id !== current.id &&
      !managerPlayerIds.includes(alt.id) && // EXCLUDE players already in the team
      (alt.trimean > current.trimean) &&   // Basic quality filter
      (alt.cost * 10) <= (totalBudget + 500)
    );

    for (const alt of alternatives) {
      const inFDR = getAvgFDR(elements.find((e: any) => e.id === alt.id)?.team || 0);
      const fdrImpact = outFDR - inFDR; // Positive = easier fixtures
      const trimeanDiff = alt.trimean - current.trimean;

      // Effectiveness score: weighted trimean improvement + fixture bonus
      const effectiveness = trimeanDiff + (fdrImpact * 0.5);

      // Threshold set to 0.1 to show ANY positive move.
      if (effectiveness > 0.1) {
        recommendations.push({
          playerOut: current,
          playerIn: alt,
          trimeanDiff,
          costDiff: alt.cost - (sellingPrice / 10),
          fixtureDifficultyImpact: fdrImpact,
          playerOutFDR: outFDR,
          playerInFDR: inFDR,
          effectivenessScore: effectiveness,
          priority: Math.round(effectiveness * 10),
          reasoning: `${alt.webName} is outperforming (Secret Sauce +${trimeanDiff.toFixed(2)}) with ${fdrImpact > 0 ? 'easier' : 'similar'} fixtures.`
        });
      }
    }
  }

  // 5. Finalize top recommendations using Proper Greedy Selection
  // This ensures we get the best unique moves without skipping players inadvertently
  const sortedRecs = recommendations.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  const finalRecs: any[] = [];
  const usedIn = new Set<number>();
  const usedOut = new Set<number>();

  // Greedy selection: pick top alternatives without duplicates
  for (const rec of sortedRecs) {
    if (finalRecs.length >= 5) break; // Limit to top 5 recommendations
    if (usedIn.has(rec.playerIn.id) || usedOut.has(rec.playerOut.id)) continue;

    finalRecs.push(rec);
    usedIn.add(rec.playerIn.id);
    usedOut.add(rec.playerOut.id);
  }

  return finalRecs;
}
