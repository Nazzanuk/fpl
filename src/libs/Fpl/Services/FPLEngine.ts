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

const limit = pLimit(5); // Concurrency control - max 5 concurrent requests

/**
 * Calculate quartiles from an array of numbers
 */
function calculateQuartiles(values: number[]): { q1: number; q2: number; q3: number } {
  if (values.length === 0) {
    return { q1: 0, q2: 0, q3: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate median (Q2)
  const q2 = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Calculate Q1 (median of lower half)
  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const q1 = lowerHalf.length % 2 === 0
    ? (lowerHalf[lowerHalf.length / 2 - 1] + lowerHalf[lowerHalf.length / 2]) / 2
    : lowerHalf[Math.floor(lowerHalf.length / 2)];

  // Calculate Q3 (median of upper half)
  const upperHalf = n % 2 === 0
    ? sorted.slice(n / 2)
    : sorted.slice(Math.floor(n / 2) + 1);
  const q3 = upperHalf.length % 2 === 0
    ? (upperHalf[upperHalf.length / 2 - 1] + upperHalf[upperHalf.length / 2]) / 2
    : upperHalf[Math.floor(upperHalf.length / 2)];

  return { q1, q2, q3 };
}

/**
 * Calculate Tukey's Trimean: (Q1 + 2*Q2 + Q3) / 4
 */
function calculateTrimean(values: number[]): number {
  if (values.length === 0) return 0;
  const { q1, q2, q3 } = calculateQuartiles(values);
  return (q1 + 2 * q2 + q3) / 4;
}

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
        // Only include gameweeks where the player actually played (minutes > 0)
        const gameweekPoints = summary.history
          .filter((gw: any) => gw.minutes > 0)
          .map((gw: any) => gw.total_points);

        const trimean = calculateTrimean(gameweekPoints);
        return { id, trimean };
      } catch (error) {
        console.error(`Failed to fetch summary for player ${id}:`, error);
        return { id, trimean: 0 };
      }
    }))
  );

  summaries.forEach(({ id, trimean }) => {
    trimeanMap.set(id, trimean);
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
      starters.forEach((pick: any) => allPlayerIds.add(pick.element));
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
  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);
  
  // Fetch live stats for current GW points
  const liveStats = currentEvent ? await getEventLive(currentEvent.id) : null;

  // Calculate value score for each player
  const scoredPlayers = bootstrap.elements.map((element: any) => {
    const team = bootstrap.teams.find((t: any) => t.id === element.team);
    const form = parseFloat(element.form) || 0;
    const cost = element.now_cost / 10;
    const pointsPerGame = parseFloat(element.points_per_game) || 0;
    // Value score: combine points per game with efficiency (points per cost)
    const valueScore = cost > 0 ? pointsPerGame + (element.total_points / cost) : pointsPerGame;
    // Trimean: use points_per_game as season-long average (better than form for consistency)
    const trimean = pointsPerGame;
    
    // Get current GW points from live stats
    const liveData = liveStats?.elements?.find((el: any) => el.id === element.id);
    const gwPoints = liveData?.stats?.total_points || 0;

    return {
      id: element.id,
      webName: element.web_name,
      teamId: element.team,
      teamName: team?.short_name || '',
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type), // Convert to string: 'GKP', 'DEF', 'MID', 'FWD'
      positionNumber: element.element_type, // Keep number for filtering: 1=GK, 2=DEF, 3=MID, 4=FWD
      cost,
      totalPoints: element.total_points,
      form,
      pointsPerGame,
      valueScore,
      trimean,
      gwPoints,
      status: element.status,
    };
  });

  // Filter out unavailable players
  const availablePlayers = scoredPlayers.filter((p: any) => p.status === 'a');

  // Greedy selection algorithm
  const BUDGET = 100.0;
  const squad: any[] = [];
  let remainingBudget = BUDGET;

  // Position requirements: 2 GK, 5 DEF, 5 MID, 3 FWD
  const positionLimits = { 1: 2, 2: 5, 3: 5, 4: 3 };
  const positionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const teamCounts: Record<number, number> = {};

  // Sort by value score descending
  const sortedPlayers = [...availablePlayers].sort((a, b) => b.valueScore - a.valueScore);

  // Select players greedily
  for (const player of sortedPlayers) {
    if (squad.length >= 15) break;

    const position = player.positionNumber as 1 | 2 | 3 | 4;
    const teamId = player.teamId;

    // Check constraints
    if (positionCounts[position] >= positionLimits[position]) continue; // Position full
    if ((teamCounts[teamId] || 0) >= 3) continue; // Max 3 per team
    if (player.cost > remainingBudget) continue; // Over budget

    // Add player to squad
    squad.push(player);
    remainingBudget -= player.cost;
    positionCounts[position]++;
    teamCounts[teamId] = (teamCounts[teamId] || 0) + 1;
  }

  // Fetch real trimean values for the selected squad
  const squadIds = squad.map(p => p.id);
  const trimeanMap = await fetchPlayersTrimean(squadIds);

  // Update squad with real trimean values
  squad.forEach(player => {
    player.trimean = trimeanMap.get(player.id) || player.pointsPerGame;
  });

  // Select best 11 from 15 for starting lineup
  // Always start: 1 GK, then best of remaining positions
  const gks = squad.filter(p => p.position === 'GKP');
  const defs = squad.filter(p => p.position === 'DEF').sort((a, b) => b.valueScore - a.valueScore);
  const mids = squad.filter(p => p.position === 'MID').sort((a, b) => b.valueScore - a.valueScore);
  const fwds = squad.filter(p => p.position === 'FWD').sort((a, b) => b.valueScore - a.valueScore);

  // Optimal formation: 1 GK, 3-5 DEF, 2-5 MID, 1-3 FWD (must total 11)
  // Use 4-4-2 as default balanced formation
  const starting11 = [
    gks[0], // 1 GK
    ...defs.slice(0, 4), // 4 DEF
    ...mids.slice(0, 4), // 4 MID
    ...fwds.slice(0, 2), // 2 FWD
  ].filter(Boolean);

  const totalCost = squad.reduce((sum, p) => sum + p.cost, 0);
  const totalPoints = squad.reduce((sum, p) => sum + p.totalPoints, 0);
  const totalValue = squad.reduce((sum, p) => sum + p.valueScore, 0);
  const totalTrimean = squad.reduce((sum, p) => sum + p.trimean, 0);

  return {
    players: squad,
    starting11,
    totalPoints,
    totalValue,
    totalCost,
    totalTrimean,
    formation: '4-4-2',
  };
}

/**
 * Get transfer recommendations for a manager
 * Compares current squad to optimal alternatives with fixture difficulty analysis
 */
export async function getTransferRecommendations(managerId: number) {
  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);

  if (!currentEvent) {
    return [];
  }

  // Get manager's current team
  let currentPicks: any;
  try {
    currentPicks = await getManagerPicks(managerId, currentEvent.id);
  } catch {
    return []; // Can't get picks, return empty
  }

  // Fetch all fixtures to analyze next 3 gameweeks
  const allFixtures = await getAllFixtures();
  const nextThreeGWs = [currentEvent.id, currentEvent.id + 1, currentEvent.id + 2];

  // Build fixture difficulty map per team: { teamId -> averageDifficulty }
  const teamFixtureDifficulty = new Map<number, { avgDifficulty: number; fixtures: number }>();

  allFixtures.forEach((fixture: any) => {
    if (nextThreeGWs.includes(fixture.event)) {
      // Home team
      if (!teamFixtureDifficulty.has(fixture.team_h)) {
        teamFixtureDifficulty.set(fixture.team_h, { avgDifficulty: 0, fixtures: 0 });
      }
      const homeData = teamFixtureDifficulty.get(fixture.team_h)!;
      homeData.avgDifficulty += fixture.team_h_difficulty;
      homeData.fixtures += 1;

      // Away team
      if (!teamFixtureDifficulty.has(fixture.team_a)) {
        teamFixtureDifficulty.set(fixture.team_a, { avgDifficulty: 0, fixtures: 0 });
      }
      const awayData = teamFixtureDifficulty.get(fixture.team_a)!;
      awayData.avgDifficulty += fixture.team_a_difficulty;
      awayData.fixtures += 1;
    }
  });

  // Calculate average difficulty per team
  teamFixtureDifficulty.forEach((data, teamId) => {
    if (data.fixtures > 0) {
      data.avgDifficulty = data.avgDifficulty / data.fixtures;
    }
  });

  const managerSquad = currentPicks.picks.map((pick: any) => {
    const element = bootstrap.elements.find((e: any) => e.id === pick.element);
    if (!element) return null;

    const team = bootstrap.teams.find((t: any) => t.id === element.team);
    const form = parseFloat(element.form) || 0;
    const cost = element.now_cost / 10;
    const pointsPerGame = parseFloat(element.points_per_game) || 0;
    const valueScore = cost > 0 ? pointsPerGame + (element.total_points / cost) : pointsPerGame;
    const trimean = pointsPerGame;

    return {
      id: element.id,
      webName: element.web_name,
      teamId: element.team,
      teamName: team?.short_name || '',
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type), // Convert to string: 'GKP', 'DEF', 'MID', 'FWD'
      cost,
      form,
      pointsPerGame,
      totalPoints: element.total_points,
      status: element.status,
      valueScore,
      trimean,
    };
  }).filter(Boolean);

  // Fetch real trimean values for manager's squad
  const managerSquadIds = managerSquad.map((p: any) => p.id);
  const managerTrimeanMap = await fetchPlayersTrimean(managerSquadIds);

  // Update manager squad with real trimean values
  managerSquad.forEach((player: any) => {
    player.trimean = managerTrimeanMap.get(player.id) || player.pointsPerGame;
  });

  // Get all available players as alternatives
  const allPlayers = bootstrap.elements.map((element: any) => {
    const team = bootstrap.teams.find((t: any) => t.id === element.team);
    const form = parseFloat(element.form) || 0;
    const cost = element.now_cost / 10;
    const pointsPerGame = parseFloat(element.points_per_game) || 0;
    const valueScore = cost > 0 ? pointsPerGame + (element.total_points / cost) : pointsPerGame;
    const trimean = pointsPerGame;

    return {
      id: element.id,
      webName: element.web_name,
      teamId: element.team,
      teamName: team?.short_name || '',
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type), // Convert to string: 'GKP', 'DEF', 'MID', 'FWD'
      cost,
      form,
      pointsPerGame,
      totalPoints: element.total_points,
      status: element.status,
      valueScore,
      trimean,
    };
  }).filter((p: any) => p.status === 'a'); // Only available players

  const recommendations: any[] = [];
  const bankBalance = (currentPicks.entry_history?.bank || 0) / 10;
  const usedPlayerInIds = new Set<number>(); // Track players already recommended as transfers in
  const usedPlayerOutIds = new Set<number>(); // Track players already recommended as transfers out

  // Check each player in manager's squad for potential upgrades
  for (const currentPlayer of managerSquad) {
    // Skip if this player has already been recommended for transfer out
    if (usedPlayerOutIds.has(currentPlayer.id)) {
      continue;
    }

    // Find alternatives in same position
    const alternatives = allPlayers.filter((p: any) =>
      p.position === currentPlayer.position &&
      p.id !== currentPlayer.id &&
      p.cost <= currentPlayer.cost + bankBalance && // Affordable with current bank
      !usedPlayerInIds.has(p.id) // Not already recommended as a transfer in
    );

    // Sort by value score
    const betterAlternatives = alternatives
      .filter((alt: any) => alt.valueScore > currentPlayer.valueScore * 1.1) // At least 10% better
      .sort((a: any, b: any) => b.valueScore - a.valueScore)
      .slice(0, 3); // Top 3 alternatives per position

    for (const alternative of betterAlternatives) {
      const valueDiff = alternative.valueScore - currentPlayer.valueScore;
      const costDiff = alternative.cost - currentPlayer.cost;

      // Get fixture difficulty for both players' teams
      const playerOutFDR = teamFixtureDifficulty.get(currentPlayer.teamId)?.avgDifficulty || 3;
      const playerInFDR = teamFixtureDifficulty.get(alternative.teamId)?.avgDifficulty || 3;

      // Lower difficulty is better, so positive impact means easier fixtures
      const fixtureDifficultyImpact = playerOutFDR - playerInFDR;

      recommendations.push({
        playerOut: currentPlayer,
        playerIn: alternative,
        reasoning: `${alternative.webName} has significantly better value (${valueDiff.toFixed(1)} higher value score) and is ${costDiff >= 0 ? `£${costDiff.toFixed(1)}m more` : `£${Math.abs(costDiff).toFixed(1)}m less`}.`,
        priority: Math.round(valueDiff * 10),
        trimeanDiff: valueDiff,
        costDiff,
        fixtureDifficultyImpact,
        playerOutFDR,
        playerInFDR,
      });

      // Mark players as used so they can't be recommended again
      usedPlayerInIds.add(alternative.id);
      usedPlayerOutIds.add(currentPlayer.id);

      // Once we find a good upgrade for this player, move to next player in squad
      break;
    }
  }

  // Sort by priority and take top 15 for trimean fetching
  const topRecommendations = recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 15);

  // Fetch real trimean for playerIn alternatives (only the ones in recommendations)
  const alternativeIds = [...new Set(topRecommendations.map(r => r.playerIn.id))];
  const alternativeTrimeanMap = await fetchPlayersTrimean(alternativeIds);

  // Update recommendations with real trimean values
  topRecommendations.forEach((rec: any) => {
    const realTrimean = alternativeTrimeanMap.get(rec.playerIn.id);
    if (realTrimean !== undefined) {
      rec.playerIn.trimean = realTrimean;
    }

    // Recalculate trimeanDiff with real values
    rec.trimeanDiff = rec.playerIn.trimean - rec.playerOut.trimean;

    // Calculate effectiveness score: trimean improvement + fixture difficulty bonus
    // Lower FDR is better, so positive impact (easier fixtures) adds to effectiveness
    rec.effectivenessScore = rec.trimeanDiff + (rec.fixtureDifficultyImpact * 0.5);
  });

  // Sort by effectiveness (best bang for buck) and filter for budget constraints
  const sortedByEffectiveness = topRecommendations
    .filter((rec: any) => rec.trimeanDiff > 0) // Only positive improvements
    .sort((a, b) => b.effectivenessScore - a.effectivenessScore);

  // Ensure budget constraints: player can afford all recommended transfers
  const affordableRecommendations: any[] = [];
  let runningBank = bankBalance;

  for (const rec of sortedByEffectiveness) {
    const netCost = rec.costDiff; // Positive = costs money, Negative = saves money

    // Check if this transfer is affordable with current running bank
    if (netCost <= runningBank) {
      affordableRecommendations.push(rec);
      runningBank -= netCost; // Update running bank balance

      // Limit to 5 most effective recommendations
      if (affordableRecommendations.length >= 5) {
        break;
      }
    }
  }

  return affordableRecommendations;
}
