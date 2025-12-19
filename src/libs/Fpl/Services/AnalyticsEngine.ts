/**
 * Analytics Engine - Statistical analysis and trends
 */

import {
  getBootstrapStatic,
  getLeagueManagers,
  getManagerPicks,
  getManagerHistory,
  getAllFixtures,
  getElementSummary,
} from '../Data/Client/FPLApiClient';
import pLimit from 'p-limit';

const limit = pLimit(5);

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
 * Calculate median from an array of numbers
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
}

/**
 * Get league trends and analytics
 */
export async function getLeagueTrends(leagueId: number): Promise<LeagueTrend[]> {
  const [bootstrap, leagueData] = await Promise.all([
    getBootstrapStatic(),
    getLeagueManagers(leagueId),
  ]);

  const currentEvent = bootstrap.events.find((e: any) => e.is_current);
  const managers = leagueData.standings.results;

  // Fetch manager histories
  const histories = await Promise.all(
    managers.map((m: any) => limit(() => getManagerHistory(m.entry)))
  );

  // Build trends array
  return managers.map((manager: any, index: number) => {
    const history = histories[index];

    return {
      managerId: manager.entry,
      managerName: manager.player_name,
      teamName: manager.entry_name,
      history: history.current.map((gw: any) => ({
        event: gw.event,
        points: gw.points,
        totalPoints: gw.total_points,
        rank: gw.rank || 0,
      })),
    };
  });
}

/**
 * Get manager history data with analytics
 */
export async function getManagerHistoryData(managerId: number, leagueId?: number): Promise<ManagerHistoryData> {
  const history = await getManagerHistory(managerId);

  // Fetch manager details if leagueId provided
  let managerName = 'Manager';
  let teamName = 'Team';

  if (leagueId) {
    const leagueData = await getLeagueManagers(leagueId);
    const manager = leagueData.standings.results.find((m: any) => m.entry === managerId);
    if (manager) {
      managerName = manager.player_name;
      teamName = manager.entry_name;
    }
  }

  const current = history.current.map((gw: any) => ({
    event: gw.event,
    points: gw.points,
    totalPoints: gw.total_points,
    rank: gw.rank,
    rankSort: gw.rank_sort,
    overallRank: gw.overall_rank,
    bank: gw.bank / 10,
    value: gw.value / 10,
    eventTransfers: gw.event_transfers,
    eventTransfersCost: gw.event_transfers_cost,
    pointsOnBench: gw.points_on_bench,
  }));

  // Calculate stats
  const avgPoints = current.length > 0
    ? Math.round(current.reduce((sum: number, gw: any) => sum + gw.points, 0) / current.length)
    : 0;

  const bestGw = current.length > 0
    ? current.reduce((best: any, gw: any) => gw.points > best.points ? gw : best, current[0])
    : { event: 0, points: 0 };

  const worstGw = current.length > 0
    ? current.reduce((worst: any, gw: any) => gw.points < worst.points ? gw : worst, current[0])
    : { event: 0, points: 0 };

  const totalTransfersCost = current.reduce((sum: number, gw: any) => sum + (gw.eventTransfersCost || 0), 0);

  return {
    managerName,
    teamName,
    current,
    gameweeks: current, // Alias for current
    chips: history.chips.map((chip: any) => ({
      name: chip.name,
      event: chip.event,
      time: chip.time,
    })),
    avgPoints,
    bestGw: { event: bestGw.event, points: bestGw.points },
    worstGw: { event: worstGw.event, points: worstGw.points },
    totalTransfersCost,
  };
}

/**
 * Get aggregated player statistics with real Tukey's Trimean
 */
export async function getPlayerStatsAggregate(elementIds?: number[]) {
  const bootstrap = await getBootstrapStatic();

  // If no elementIds provided, return top 20 players by total points
  const idsToProcess = elementIds || bootstrap.elements
    .sort((a: any, b: any) => b.total_points - a.total_points)
    .slice(0, 20)
    .map((el: any) => el.id);

  // Fetch historical data for all players in parallel
  const historicalData = await Promise.all(
    idsToProcess.map((id: number) => limit(async () => {
      try {
        const summary = await getElementSummary(id);
        // Only include gameweeks where the player actually played (minutes > 0)
        const gameweekPoints = summary.history
          .filter((gw: any) => gw.minutes > 0)
          .map((gw: any) => gw.total_points);
        return {
          id,
          gameweekPoints,
          median: calculateMedian(gameweekPoints),
          trimean: calculateTrimean(gameweekPoints),
        };
      } catch (error) {
        console.error(`Failed to fetch history for player ${id}:`, error);
        return { id, gameweekPoints: [], median: 0, trimean: 0 };
      }
    }))
  );

  // Create a map for quick lookup
  const statsMap = new Map(historicalData.map(h => [h.id, h]));

  return idsToProcess.map((elementId: number) => {
    const element = bootstrap.elements.find((el: any) => el.id === elementId);
    if (!element) return null;

    const team = bootstrap.teams.find((t: any) => t.id === element.team);
    const pointsPerGame = parseFloat(element.points_per_game) || 0;
    const stats = statsMap.get(elementId);

    return {
      id: element.id,
      webName: element.web_name,
      teamName: team?.name || '',
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type),
      cost: element.now_cost / 10,
      totalPoints: element.total_points,
      averagePoints: pointsPerGame,
      medianPoints: stats?.median || pointsPerGame,
      trimean: stats?.trimean || pointsPerGame,
      lastGwPoints: element.event_points || 0,
      matchesPlayed: element.minutes > 0 ? Math.floor(element.minutes / 90) : 0,
      injuryStatus: element.news || null,
    };
  }).filter(Boolean);
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
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

// Export types
export interface ManagerHistoryData {
  managerName: string;
  teamName: string;
  current: any[];
  gameweeks: any[]; // Alias for current
  chips: any[];
  avgPoints: number;
  bestGw: { event: number; points: number };
  worstGw: { event: number; points: number };
  totalTransfersCost: number;
}

export interface LeagueTrend {
  managerId: number;
  managerName: string;
  teamName: string;
  history: Array<{
    event: number;
    points: number;
    totalPoints: number;
    rank: number;
  }>;
}

export interface ChipRecommendation {
  chipName: string;
  chip: string; // Alias for chipName
  chipLabel: string;
  gameweek: number;
  recommendedGw: number; // Alias for gameweek
  reasoning: string;
  reason: string; // Alias for reasoning
  score: number;
  managerPlayers?: any[];
  fixtures: any[];
}

export interface TopPlayer {
  id: number;
  elementId: number;
  name: string;
  webName: string;
  teamShortName: string;
  position: string;
  price: number;
  totalPoints: number;
  points: number;
  form: string;
  selectedByPercent: number;
  goalsScored: number;
  assists: number;
}

export interface FDRData {
  team: string;
  teamId: number;
  teamShortName: string;
  fixtures: any[];
  difficulty: number;
  avgDifficulty: number;
}

export interface PriceChangePlayer {
  id: number;
  elementId: number;
  name: string;
  webName: string;
  teamShortName: string;
  position: string;
  currentPrice: number;
  priceChange: number;
  form: string;
  selectedByPercent: number;
  netTransfers: number;
}

/**
 * Get chip recommendations for a manager based on team and fixtures
 */
export async function getChipRecommendations(managerId: number): Promise<ChipRecommendation[]> {
  const [bootstrap, history, fixtures] = await Promise.all([
    getBootstrapStatic(),
    getManagerHistory(managerId),
    getAllFixtures(),
  ]);

  const currentEvent = bootstrap.events.find((e: any) => e.is_current);
  if (!currentEvent) {
    return [];
  }

  const currentGw = currentEvent.id;
  const usedChips = history.chips.map((c: any) => c.name);
  const recommendations: ChipRecommendation[] = [];

  // Get manager's current team
  let managerPlayers: any[] = [];
  try {
    const picks = await getManagerPicks(managerId, currentGw);
    managerPlayers = picks.picks || [];
  } catch {
    // If current GW picks not available, continue without them
  }

  // Upcoming fixtures for next 10 gameweeks
  const upcomingFixtures = fixtures.filter(
    (f: any) => f.event && f.event >= currentGw && f.event <= currentGw + 10
  );

  // Bench Boost - recommend if not used
  if (!usedChips.includes('bboost')) {
    // Find gameweeks where bench would score well (easy fixtures)
    const benchBoostGws = [];

    for (let gw = currentGw; gw <= currentGw + 10; gw++) {
      const gwFixtures = upcomingFixtures.filter((f: any) => f.event === gw);

      // Calculate average difficulty for this gameweek
      const avgDifficulty = gwFixtures.length > 0
        ? gwFixtures.reduce((sum: number, f: any) =>
            sum + (f.team_h_difficulty + f.team_a_difficulty) / 2, 0) / gwFixtures.length
        : 3;

      if (avgDifficulty < 3) {
        benchBoostGws.push({ gw, difficulty: avgDifficulty });
      }
    }

    if (benchBoostGws.length > 0) {
      const bestGw = benchBoostGws.sort((a, b) => a.difficulty - b.difficulty)[0];
      recommendations.push({
        chipName: 'Bench Boost',
        chip: 'bboost',
        chipLabel: 'Bench Boost',
        gameweek: bestGw.gw,
        recommendedGw: bestGw.gw,
        reasoning: `GW${bestGw.gw} has favorable fixtures across the board with average difficulty of ${bestGw.difficulty.toFixed(1)}. Your bench players are likely to score well.`,
        reason: `GW${bestGw.gw} has favorable fixtures`,
        score: 10 - Math.round(bestGw.difficulty * 2),
        managerPlayers,
        fixtures: upcomingFixtures.filter((f: any) => f.event === bestGw.gw),
      });
    }
  }

  // Triple Captain - recommend for easy fixtures with premium players
  if (!usedChips.includes('3xc')) {
    const tripleCapGws = [];

    for (let gw = currentGw; gw <= currentGw + 10; gw++) {
      const gwFixtures = upcomingFixtures.filter((f: any) => f.event === gw);

      // Find easiest fixtures this gameweek
      const easyFixtures = gwFixtures.filter((f: any) =>
        f.team_h_difficulty <= 2 || f.team_a_difficulty <= 2
      );

      if (easyFixtures.length > 0) {
        const avgDifficulty = easyFixtures.reduce((sum: number, f: any) =>
          sum + Math.min(f.team_h_difficulty, f.team_a_difficulty), 0) / easyFixtures.length;

        tripleCapGws.push({ gw, difficulty: avgDifficulty, count: easyFixtures.length });
      }
    }

    if (tripleCapGws.length > 0) {
      const bestGw = tripleCapGws.sort((a, b) => a.difficulty - b.difficulty)[0];
      recommendations.push({
        chipName: 'Triple Captain',
        chip: '3xc',
        chipLabel: 'Triple Captain',
        gameweek: bestGw.gw,
        recommendedGw: bestGw.gw,
        reasoning: `GW${bestGw.gw} has ${bestGw.count} very favorable fixture(s). Triple captain your premium players for maximum returns.`,
        reason: `GW${bestGw.gw} has easy fixtures for premiums`,
        score: 10 - Math.round(bestGw.difficulty * 3),
        managerPlayers,
        fixtures: upcomingFixtures.filter((f: any) => f.event === bestGw.gw),
      });
    }
  }

  // Free Hit - look for blank or double gameweeks
  if (!usedChips.includes('freehit')) {
    // Count fixtures per gameweek
    const fixturesByGw: Record<number, number> = {};
    upcomingFixtures.forEach((f: any) => {
      if (f.event) {
        fixturesByGw[f.event] = (fixturesByGw[f.event] || 0) + 1;
      }
    });

    // Find blank gameweeks (fewer fixtures) or double gameweeks (more fixtures)
    const avgFixtures = Object.values(fixturesByGw).reduce((a, b) => a + b, 0) / Object.keys(fixturesByGw).length;

    for (let gw = currentGw; gw <= currentGw + 10; gw++) {
      const fixtureCount = fixturesByGw[gw] || 0;

      // Double gameweek (more than 1.5x average) or blank gameweek (less than 0.5x average)
      if (fixtureCount > avgFixtures * 1.5 || fixtureCount < avgFixtures * 0.5) {
        const isDouble = fixtureCount > avgFixtures;
        recommendations.push({
          chipName: 'Free Hit',
          chip: 'freehit',
          chipLabel: 'Free Hit',
          gameweek: gw,
          recommendedGw: gw,
          reasoning: isDouble
            ? `GW${gw} appears to be a double gameweek with ${fixtureCount} fixtures. Free Hit to maximize players with two matches.`
            : `GW${gw} looks like a blank gameweek with only ${fixtureCount} fixtures. Free Hit to field a full team.`,
          reason: isDouble ? `GW${gw} double gameweek` : `GW${gw} blank gameweek`,
          score: isDouble ? 9 : 7,
          managerPlayers,
          fixtures: upcomingFixtures.filter((f: any) => f.event === gw),
        });
        break; // Only recommend one Free Hit opportunity
      }
    }
  }

  // Wildcard - general recommendation if team needs refresh
  if (!usedChips.includes('wildcard')) {
    // Check if many players are injured or out of form
    let injuredCount = 0;
    let poorFormCount = 0;

    if (managerPlayers.length > 0) {
      for (const pick of managerPlayers) {
        const element = bootstrap.elements.find((e: any) => e.id === pick.element);
        if (element) {
          if (element.status !== 'a') injuredCount++;
          if (parseFloat(element.form) < 2) poorFormCount++;
        }
      }
    }

    if (injuredCount >= 3 || poorFormCount >= 5) {
      recommendations.push({
        chipName: 'Wildcard',
        chip: 'wildcard',
        chipLabel: 'Wildcard',
        gameweek: currentGw + 1,
        recommendedGw: currentGw + 1,
        reasoning: `Your team needs refreshing with ${injuredCount} injured player(s) and ${poorFormCount} in poor form. Use Wildcard to rebuild.`,
        reason: 'Team needs refreshing',
        score: Math.min(injuredCount + poorFormCount, 10),
        managerPlayers,
        fixtures: upcomingFixtures.filter((f: any) => f.event === currentGw + 1),
      });
    }
  }

  // Sort by score (highest first)
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Get FDR (Fixture Difficulty Rating) data for upcoming gameweeks
 */
export async function getFDRData(gameweeks = 5): Promise<FDRData[]> {
  const [bootstrap, fixtures] = await Promise.all([
    getBootstrapStatic(),
    getAllFixtures(),
  ]);

  // Get current gameweek
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);
  if (!currentEvent) {
    return [];
  }

  const currentGw = currentEvent.id;
  const maxGw = currentGw + gameweeks - 1;

  // Filter fixtures for the next N gameweeks
  const upcomingFixtures = fixtures.filter(
    (f: any) => f.event && f.event >= currentGw && f.event <= maxGw
  );

  // Group fixtures by team
  const teamFixtures: Record<number, any[]> = {};

  upcomingFixtures.forEach((fixture: any) => {
    // Add to home team
    if (!teamFixtures[fixture.team_h]) {
      teamFixtures[fixture.team_h] = [];
    }
    teamFixtures[fixture.team_h].push({
      event: fixture.event,
      opponent: fixture.team_a,
      isHome: true,
      difficulty: fixture.team_h_difficulty,
    });

    // Add to away team
    if (!teamFixtures[fixture.team_a]) {
      teamFixtures[fixture.team_a] = [];
    }
    teamFixtures[fixture.team_a].push({
      event: fixture.event,
      opponent: fixture.team_h,
      isHome: false,
      difficulty: fixture.team_a_difficulty,
    });
  });

  // Build FDR data for each team
  const fdrData: FDRData[] = bootstrap.teams.map((team: any) => {
    const fixtures = teamFixtures[team.id] || [];

    // Calculate average difficulty
    const avgDifficulty = fixtures.length > 0
      ? fixtures.reduce((sum: number, f: any) => sum + f.difficulty, 0) / fixtures.length
      : 0;

    return {
      team: team.name,
      teamId: team.id,
      teamShortName: team.short_name,
      fixtures: fixtures.sort((a: any, b: any) => a.event - b.event),
      difficulty: avgDifficulty,
      avgDifficulty,
    };
  });

  // Sort by average difficulty (easiest fixtures first)
  return fdrData.sort((a, b) => a.avgDifficulty - b.avgDifficulty);
}

export interface TopPerformersData {
  byPoints: TopPlayer[];
  byForm: TopPlayer[];
  byValue: TopPlayer[];
  differentials: TopPlayer[];
}

/**
 * Get top performers across all FPL
 */
export async function getTopPerformers(leagueId?: number): Promise<TopPerformersData> {
  const bootstrap = await getBootstrapStatic();

  // Map elements to TopPlayer format
  const allPlayers: TopPlayer[] = bootstrap.elements.map((element: any) => {
    const team = bootstrap.teams.find((t: any) => t.id === element.team);

    return {
      id: element.id,
      elementId: element.id,
      name: `${element.first_name} ${element.second_name}`,
      webName: element.web_name,
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type),
      price: element.now_cost / 10,
      totalPoints: element.total_points,
      points: element.total_points,
      form: element.form,
      selectedByPercent: parseFloat(element.selected_by_percent),
      goalsScored: element.goals_scored,
      assists: element.assists,
    };
  });

  // Filter out players with 0 minutes (haven't played)
  const activePlayers = allPlayers.filter(p => p.totalPoints > 0);

  // By Points - sort by total points
  const byPoints = [...activePlayers]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  // By Form - sort by form (higher is better)
  const byForm = [...activePlayers]
    .filter(p => parseFloat(p.form) > 0)
    .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
    .slice(0, 20);

  // By Value - calculate points per cost ratio
  const byValue = [...activePlayers]
    .filter(p => p.price > 0)
    .sort((a, b) => (b.totalPoints / b.price) - (a.totalPoints / a.price))
    .slice(0, 20);

  // Differentials - low ownership (< 10%) with good form
  const differentials = [...activePlayers]
    .filter(p => p.selectedByPercent < 10 && parseFloat(p.form) > 0)
    .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
    .slice(0, 20);

  return {
    byPoints,
    byForm,
    byValue,
    differentials,
  };
}

export interface PriceChangeData {
  rising: PriceChangePlayer[];
  falling: PriceChangePlayer[];
}

/**
 * Get players with price changes
 */
export async function getPriceChangePlayers(): Promise<PriceChangeData> {
  const bootstrap = await getBootstrapStatic();

  // Map elements to PriceChangePlayer format
  const allPlayers: PriceChangePlayer[] = bootstrap.elements.map((element: any) => {
    const team = bootstrap.teams.find((t: any) => t.id === element.team);

    return {
      id: element.id,
      elementId: element.id,
      name: `${element.first_name} ${element.second_name}`,
      webName: element.web_name,
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type),
      currentPrice: element.now_cost / 10,
      priceChange: element.cost_change_event / 10,
      form: element.form,
      selectedByPercent: parseFloat(element.selected_by_percent),
      netTransfers: element.transfers_in_event - element.transfers_out_event,
    };
  });

  // Rising - positive price change this event OR high net transfers
  const rising = allPlayers
    .filter(p => p.priceChange > 0 || p.netTransfers > 50000)
    .sort((a, b) => {
      // Primary sort by price change, secondary by net transfers
      if (b.priceChange !== a.priceChange) {
        return b.priceChange - a.priceChange;
      }
      return b.netTransfers - a.netTransfers;
    })
    .slice(0, 20);

  // Falling - negative price change this event OR high negative net transfers
  const falling = allPlayers
    .filter(p => p.priceChange < 0 || p.netTransfers < -50000)
    .sort((a, b) => {
      // Primary sort by price change (most negative first), secondary by net transfers
      if (a.priceChange !== b.priceChange) {
        return a.priceChange - b.priceChange;
      }
      return a.netTransfers - b.netTransfers;
    })
    .slice(0, 20);

  return {
    rising,
    falling,
  };
}
