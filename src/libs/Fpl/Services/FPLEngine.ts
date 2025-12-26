/**
 * FPL Engine - Business logic for building live league tables
 * Following CLAUDE.md specification: p-limit concurrency control, live score calculation
 */

import pLimit from 'p-limit';
import {
  getBootstrapStatic,
  getLeagueManagers,
  getEventLive,
  getManagerPicks,
  getElementSummary,
  getAllFixtures,
} from '../Data/Client/FPLApiClient';
import { getPlayerStatsAggregate } from './AnalyticsEngine';

import { cacheLife, cacheTag } from 'next/cache';
import { getGameweekStatus } from '../Utils/GameweekStatus';

const limit = pLimit(5); // Concurrency control - max 5 concurrent requests

import { calculateTrimean } from '../Utils/MathUtils';

/**
 * Fetch trimean for multiple players in parallel
 */
async function fetchPlayersTrimean(playerIds: number[]): Promise<Map<number, number>> {
  const trimeanMap = new Map<number, number>();

  // Fetch element-summary for each player with concurrency control
  const summaries = await Promise.all(
    playerIds.map(id => limit(async () => {
      try {
        const summary = await getElementSummary(id);
        // Match "Secret Sauce" logic from AnalyticsEngine
        const validHistory = (summary.history || []).filter((gw: any) => gw.minutes > 0);
        const recentHistory = validHistory.slice(-12);
        
        const weightedHistory = recentHistory.map((gw: any) => {
          const difficulty = gw.difficulty || 3;
          const multiplier = 1 + (difficulty - 3) * 0.1;
          return gw.total_points * multiplier;
        });

        const trimean = calculateTrimean(weightedHistory);
        return { id, trimean };
      } catch (error) {
        console.error(`Failed to fetch summary for player ${id}:`, error);
        return { id, trimean: 0 };
      }
    }))
  );

  summaries.forEach((res: any) => {
    if (res) trimeanMap.set(res.id, res.trimean);
  });

  return trimeanMap;
}

// Re-export from AnalyticsEngine for backward compatibility
export { getPlayerStatsAggregate } from './AnalyticsEngine';

export interface LiveScore {
  managerId: number;
  managerName: string;
  playerName: string; // Alias for teamName
  teamName: string;
  gameweekPoints: number;
  liveGWPoints: number; // Alias for gameweekPoints
  totalPoints: number;
  liveTotalPoints: number; // Alias for totalPoints
  rank: number;
  liveRank?: number;
  rankChange?: number;
  activeChip?: string;
  transferCost?: number;
  captain?: {
    name: string;
    points: number;
  };
  teamTrimean?: number; // Total trimean score for starting 11
}

/**
 * Build live league table with real-time scores
 * Following CLAUDE.md specification
 */
export async function buildLiveTable(leagueId: number): Promise<LiveScore[]> {
  'use cache'
  cacheTag('live-table', `league-${leagueId}`);
  
  // Dynamic cache life based on live status
  const { isLive } = await getGameweekStatus();
  cacheLife(isLive ? 'live' : 'gameweek' as any);

  // 1. Fetch current gameweek from bootstrap-static
  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);

  if (!currentEvent) {
    throw new Error('No current gameweek found');
  }

  const eventId = currentEvent.id;

  // 2. Parallel fetch league standings + live element stats
  const [leagueData, liveStats] = await Promise.all([
    getLeagueManagers(leagueId),
    getEventLive(eventId),
  ]);

  const managers = leagueData.standings.results;

  // 3. Fetch each manager's picks with concurrency limit (5 concurrent)
  const picksPromises = managers.map((manager: any) =>
    limit(() => getManagerPicks(manager.entry, eventId))
  );

  const allPicks = await Promise.all(picksPromises);

  // 4. Collect all unique player IDs from starting 11s for trimean calculation
  const allPlayerIds = new Set<number>();
  allPicks.forEach((picks: any) => {
    if (picks?.picks) {
      const starters = picks.picks.filter((p: any) => p.position <= 11);
      starters.forEach((pick: any) => {
        allPlayerIds.add(pick.element);
      });
    }
  });

  // Fetch trimean values for all players in parallel
  const trimeanMap = await fetchPlayersTrimean(Array.from(allPlayerIds));

  // 5. Calculate live scores by manually summing player points with auto-subs
  const liveScores: LiveScore[] = managers.map((manager: any, index: number) => {
    const picks = allPicks[index];

    // Calculate live gameweek points from player stats
    let gameweekPoints = 0;

    if (picks?.picks) {
      // Separate starting 11 and bench
      const starting11 = picks.picks.filter((p: any) => p.position <= 11);
      const bench = picks.picks.filter((p: any) => p.position > 11).sort((a: any, b: any) => a.position - b.position);

      // Helper to get player info
      const getPlayerInfo = (pick: any) => {
        const element = bootstrap.elements.find((el: any) => el.id === pick.element);
        const liveData = liveStats.elements?.find((el: any) => el.id === pick.element);
        return {
          pick,
          position: element?.element_type || 0, // 1=GKP, 2=DEF, 3=MID, 4=FWD
          minutes: liveData?.stats?.minutes || 0,
          points: liveData?.stats?.total_points || 0,
        };
      };

      // Build active squad with auto-subs
      const activeSquad = starting11.map(getPlayerInfo);

      // Process auto-subs: replace starting players with 0 minutes
      bench.forEach((benchPick: any) => {
        const benchPlayer = getPlayerInfo(benchPick);

        // Only sub in players who actually played
        if (benchPlayer.minutes === 0) return;

        // Find a starting player with 0 minutes who can be replaced
        const subOutIndex = activeSquad.findIndex((starter: { pick: any; position: number; minutes: number; points: number }) => {
          if (starter.minutes > 0) return false;

          // Can only sub if formation remains valid
          // Simple check: GKP can only sub GKP, outfielders can sub outfielders
          if (starter.position === 1) return benchPlayer.position === 1; // GKP -> GKP only
          if (benchPlayer.position === 1) return false; // GKP can only replace GKP
          return true; // All other outfield positions can swap
        });

        if (subOutIndex !== -1) {
          activeSquad[subOutIndex] = benchPlayer;
        }
      });

      // Sum points for active squad with captain multiplier
      activeSquad.forEach((player: { pick: any; position: number; minutes: number; points: number }) => {
        gameweekPoints += player.points * (player.pick.multiplier || 1);
      });
    }

    // Get transfer cost
    const transferCost = picks?.entry_history?.event_transfers_cost || 0;
    
    // Calculate net points (with transfer cost deducted)
    const netGameweekPoints = gameweekPoints - transferCost;

    // Calculate live total points (manager.total already includes previous gameweeks)
    // We need to replace manager.event_total with our calculated netGameweekPoints
    const totalPoints = manager.total + (netGameweekPoints - manager.event_total);

    // Calculate team trimean (sum of starting 11 players)
    let teamTrimean = 0;
    if (picks?.picks) {
      const starters = picks.picks.filter((p: any) => p.position <= 11);
      teamTrimean = starters.reduce((sum: number, pick: any) => {
        return sum + (trimeanMap.get(pick.element) || 0);
      }, 0);
    }

    // Find captain info
    const captainPick = picks?.picks?.find((p: any) => p.is_captain);
    let captain = undefined;
    if (captainPick) {
      const captainElement = bootstrap.elements.find((el: any) => el.id === captainPick.element);
      const captainStats = liveStats.elements?.find((el: any) => el.id === captainPick.element);
      captain = {
        name: captainElement?.web_name || 'Unknown',
        points: (captainStats?.stats?.total_points || 0) * captainPick.multiplier,
      };
    }

    return {
      managerId: manager.entry,
      managerName: manager.player_name,
      playerName: manager.entry_name, // Alias for teamName
      teamName: manager.entry_name,
      gameweekPoints,
      liveGWPoints: gameweekPoints, // Raw GW points without transfer cost
      totalPoints,
      liveTotalPoints: totalPoints, // Alias for totalPoints
      rank: manager.rank,
      activeChip: picks?.active_chip,
      transferCost,
      captain,
      teamTrimean,
    };
  });

  // Sort by live total points (descending)
  const sorted = liveScores.sort((a, b) => b.totalPoints - a.totalPoints);

  // Add live ranks and calculate rank change
  return sorted.map((score, index) => {
    const liveRank = index + 1;
    const rankChange = score.rank - liveRank; // Positive = moved up, negative = moved down

    return {
      ...score,
      liveRank,
      rankChange,
    };
  });
}

/**
 * Get simplified manager detail
 */
export async function getManagerDetailSimple(leagueId: number, managerId: number) {
  'use cache'
  cacheTag('manager-detail', `manager-${managerId}`, `league-${leagueId}`);
  
  const { isLive } = await getGameweekStatus();
  cacheLife(isLive ? 'live' : 'gameweek' as any);

  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);

  if (!currentEvent) {
    throw new Error('No current gameweek found');
  }

  // Fetch manager picks, league standings, live stats, and fixtures
  const [picks, leagueData, liveStats, allFixtures] = await Promise.all([
    getManagerPicks(managerId, currentEvent.id),
    getLeagueManagers(leagueId),
    getEventLive(currentEvent.id),
    getAllFixtures(),
  ]);

  // Find this manager in the league
  const manager = leagueData.standings.results.find((m: any) => m.entry === managerId);
  const managers = leagueData.standings.results;

  // Calculate league statistics for this gameweek
  const gwScores = managers.map((m: any) => m.event_total);
  const avgPoints = gwScores.reduce((sum: number, s: number) => sum + s, 0) / managers.length;
  const highestPoints = Math.max(...gwScores);

  // Calculate gameweek rank
  const sortedByGwScore = [...managers].sort((a: any, b: any) => b.event_total - a.event_total);
  const gwRank = sortedByGwScore.findIndex((m: any) => m.entry === managerId) + 1;

  // Get next gameweek fixtures for each team
  const nextGwFixtures = allFixtures.filter((f: any) => f.event === currentEvent.id + 1);
  const getNextFixture = (teamId: number) => {
    const fixture = nextGwFixtures.find((f: any) => f.team_h === teamId || f.team_a === teamId);
    if (!fixture) return null;
    
    const isHome = fixture.team_h === teamId;
    const opponentId = isHome ? fixture.team_a : fixture.team_h;
    const opponent = bootstrap.teams.find((t: any) => t.id === opponentId);
    
    return {
      opponent: opponent?.short_name || 'TBD',
      isHome,
      difficulty: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty,
    };
  };

  // Enrich picks with player details, live stats, and next fixture
  const enrichedPicks = picks.picks.map((pick: any) => {
    const element = bootstrap.elements.find((e: any) => e.id === pick.element);
    const team = element ? bootstrap.teams.find((t: any) => t.id === element.team) : null;
    const liveData = liveStats.elements?.find((el: any) => el.id === pick.element);
    
    return {
      element: pick.element,
      position: pick.position,
      isCaptain: pick.is_captain,
      isViceCaptain: pick.is_vice_captain,
      multiplier: pick.multiplier,
      name: element?.web_name || 'Unknown',
      teamCode: team?.code || 1,
      teamName: team?.short_name || '',
      elementType: element?.element_type || 1,
      points: liveData?.stats?.total_points || 0,
      minutes: liveData?.stats?.minutes || 0,
      nextFixture: team ? getNextFixture(team.id) : null,
    };
  });

  // Calculate live GW points with auto-subs
  const starters = enrichedPicks.filter((p: any) => p.position <= 11);
  const bench = enrichedPicks
    .filter((p: any) => p.position > 11)
    .sort((a: any, b: any) => a.position - b.position);

  // Build active squad with auto-subs
  const activeSquad = [...starters];

  // Process auto-subs: replace starting players with 0 minutes
  bench.forEach((benchPlayer: any) => {
    // Only sub in players who actually played
    if (benchPlayer.minutes === 0) return;

    // Find a starting player with 0 minutes who can be replaced
    const subOutIndex = activeSquad.findIndex((starter: any) => {
      if (starter.minutes > 0) return false;

      // Can only sub if formation remains valid
      // GKP can only sub GKP, outfielders can sub outfielders
      if (starter.elementType === 1) return benchPlayer.elementType === 1;
      if (benchPlayer.elementType === 1) return false;
      return true;
    });

    if (subOutIndex !== -1) {
      activeSquad[subOutIndex] = benchPlayer;
    }
  });

  // Sum points for active squad with multiplier
  const liveGWPoints = activeSquad.reduce((sum: number, p: any) => sum + p.points * p.multiplier, 0);

  // Get transfer cost
  const transferCost = picks.entry_history?.event_transfers_cost || 0;

  // Calculate live total points (includes transfer cost deduction)
  const previousTotal = (manager?.total || 0) - (manager?.event_total || 0);
  const liveTotalPoints = previousTotal + liveGWPoints - transferCost;

  return {
    managerId,
    managerName: manager?.entry_name || 'Unknown Team',
    playerName: manager?.player_name || 'Unknown Manager',
    playerRegionCode: 'EN', // Placeholder
    liveTotalPoints,
    liveGWPoints,
    overallRank: manager?.rank || 0,
    totalPlayers: managers.length,
    currentGw: currentEvent.id,
    avgPoints: Math.round(avgPoints),
    highestPoints,
    gwRank,
    gwTransfers: picks.entry_history?.event_transfers || 0,
    transferCost,
    picks: enrichedPicks,
    chips: picks.active_chip,
    recentTransfers: [], // Placeholder - would need separate API call
  };
}

/**
 * Get differential players in a league (unique and missing)
 */
export async function getDifferentials(leagueId: number, managerId: number) {
  'use cache'
  cacheTag('differentials', `league-${leagueId}`, `manager-${managerId}`);
  cacheLife('gameweek' as any);

  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);

  if (!currentEvent) {
    throw new Error('No current gameweek found');
  }

  const leagueData = await getLeagueManagers(leagueId);
  const managers = leagueData.standings.results;

  // Fetch all manager picks
  const allPicks = await Promise.all(
    managers.map((m: any) => limit(() => getManagerPicks(m.entry, currentEvent.id)))
  );

  // Get the specific manager's picks
  const managerIndex = managers.findIndex((m: any) => m.entry === managerId);
  const managerPicks = managerIndex >= 0 ? allPicks[managerIndex] : null;
  const managerPlayerIds = new Set(managerPicks?.picks.map((p: any) => p.element) || []);

  // Count player ownership across all managers
  const ownershipMap = new Map<number, number>();

  allPicks.forEach((picks: any) => {
    picks.picks.forEach((pick: any) => {
      const count = ownershipMap.get(pick.element) || 0;
      ownershipMap.set(pick.element, count + 1);
    });
  });

  const totalManagers = managers.length;

  // Helper to enrich player data
  const enrichPlayerData = (elementId: number, count: number) => {
    const element = bootstrap.elements.find((el: any) => el.id === elementId);
    const team = element ? bootstrap.teams.find((t: any) => t.id === element.team) : null;

    // Find which managers own this player
    const owners: any[] = [];
    allPicks.forEach((picks: any, idx: number) => {
      if (picks.picks.some((p: any) => p.element === elementId)) {
        owners.push({
          managerId: managers[idx].entry,
          managerName: managers[idx].player_name,
        });
      }
    });

    return {
      elementId,
      name: element ? element.web_name : 'Unknown',
      teamName: team ? team.short_name : '',
      ownershipCount: count,
      ownershipPercent: (count / totalManagers) * 100,
      owners,
    };
  };

  // Unique: players manager has that few others have (< 30% ownership)
  const unique = Array.from(ownershipMap.entries())
    .filter(([elementId, count]) =>
      managerPlayerIds.has(elementId) && count / totalManagers < 0.3
    )
    .map(([elementId, count]) => enrichPlayerData(elementId, count));

  // Missing: players many others have (> 50% ownership) that manager doesn't
  const missing = Array.from(ownershipMap.entries())
    .filter(([elementId, count]) =>
      !managerPlayerIds.has(elementId) && count / totalManagers > 0.5
    )
    .map(([elementId, count]) => enrichPlayerData(elementId, count));

  return { unique, missing };
}

/**
 * Get league-wide player ownership
 */
export async function getLeaguePlayerOwnership(leagueId: number) {
  'use cache'
  cacheTag('ownership', `league-${leagueId}`);
  cacheLife('gameweek' as any);

  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);

  if (!currentEvent) {
    throw new Error('No current gameweek found');
  }

  const leagueData = await getLeagueManagers(leagueId);
  const managers = leagueData.standings.results;

  // Fetch all manager picks
  const allPicks = await Promise.all(
    managers.map((m: any) => limit(() => getManagerPicks(m.entry, currentEvent.id)))
  );

  // Count player ownership with captain data
  const ownershipMap = new Map<number, { owners: any[]; captainCount: number }>();

  allPicks.forEach((picks: any, index: number) => {
    const manager = managers[index];

    picks.picks.forEach((pick: any) => {
      const data = ownershipMap.get(pick.element) || { owners: [], captainCount: 0 };

      data.owners.push({
        managerId: manager.entry,
        managerName: manager.player_name,
        isCaptain: pick.is_captain,
      });

      if (pick.is_captain) {
        data.captainCount++;
      }

      ownershipMap.set(pick.element, data);
    });
  });

  const totalManagers = managers.length;

  return Array.from(ownershipMap.entries()).map(([elementId, data]) => {
    const element = bootstrap.elements.find((el: any) => el.id === elementId);
    const team = element ? bootstrap.teams.find((t: any) => t.id === element.team) : null;

    return {
      elementId,
      name: element ? element.web_name : 'Unknown',
      teamName: team ? team.short_name : '',
      owners: data.owners,
      ownershipPercent: (data.owners.length / totalManagers) * 100,
      captainCount: data.captainCount,
    };
  });
}

/**
 * Helper to convert element_type number to position string
 */
function getPositionName(elementType: number): string {
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

  const bootstrap = await getBootstrapStatic();
  
  // Identify top candidates by total points and ppg for trimean fetching
  const topTotalIds = bootstrap.elements
    .sort((a: any, b: any) => b.total_points - a.total_points)
    .slice(0, 100)
    .map((el: any) => el.id);
  
  const topPpgIds = bootstrap.elements
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
    const teamId = bootstrap.elements.find((e: any) => e.id === player.id)?.team;

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

/**
 * Get transfer recommendations for a manager
 * Compares current squad to optimal alternatives with fixture difficulty analysis
 */
export async function getTransferRecommendations(managerId: number) {
  'use cache'
  cacheTag('recommendations', `manager-${managerId}`);
  cacheLife('gameweek' as any);

  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);

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
  
  console.log(`[RECS] Analyzing manager ${managerId}. Squad: ${managerPlayers.length} players. Pool: ${topPlayers.length} candidates.`);
  
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
      [ {t: f.team_h, d: f.team_h_difficulty}, {t: f.team_a, d: f.team_a_difficulty} ].forEach(side => {
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
    const outFDR = getAvgFDR(bootstrap.elements.find((e: any) => e.id === current.id)?.team || 0);

    // Get the actual selling price for this player
    // Note: FPL API picks usually have 'selling_price'
    const currentPick = currentPicks.picks?.find((p: any) => p.element === current.id);
    const sellingPrice = currentPick?.selling_price || (current.cost * 10);
    
    // Bank is in raw FPL units (e.g. 5 means £0.5m)
    const bankRaw = currentPicks.entry_history?.bank || 0;
    const totalBudget = bankRaw + (sellingPrice || 0);
    
    console.log(`[RECS] ${current.webName}: trimean=${current.trimean.toFixed(2)}, price=${sellingPrice}, budget=${totalBudget}`);
    
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
      const inFDR = getAvgFDR(bootstrap.elements.find((e: any) => e.id === alt.id)?.team || 0);
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

  // 5. Finalize top 12 using Proper Greedy Selection
  // This ensures we get the best unique moves without skipping players inadvertently
  const sortedRecs = recommendations.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  const finalRecs: any[] = [];
  const usedIn = new Set<number>();
  const usedOut = new Set<number>();

  for (const rec of sortedRecs) {
    if (finalRecs.length >= 12) break;
    
    // Only allow each player to be transferred OUT once, 
    // and each target player to be transferred IN once.
    if (!usedIn.has(rec.playerIn.id) && !usedOut.has(rec.playerOut.id)) {
      finalRecs.push(rec);
      usedIn.add(rec.playerIn.id);
      usedOut.add(rec.playerOut.id);
    }
  }
  return finalRecs;
}
