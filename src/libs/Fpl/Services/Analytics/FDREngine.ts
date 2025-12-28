/**
 * FDR Engine - Fixture Difficulty Rating analysis
 * Analyzes upcoming fixture difficulty for all teams to identify
 * optimal transfer targets based on favorable upcoming schedules
 */

import {
  getAllFixtures,
} from '../../Data/Client/FPLApiClient';
import {
  getBootstrapEvents,
  getBootstrapTeams,
} from '../../Data/Client/BootstrapClient';
import { cacheLife, cacheTag } from 'next/cache';

export interface FDRData {
  team: string;
  teamId: number;
  teamShortName: string;
  fixtures: any[];
  difficulty: number;
  avgDifficulty: number;
}

/**
 * Get FDR (Fixture Difficulty Rating) data for upcoming gameweeks
 */
export async function getFDRData(gameweeks = 5): Promise<FDRData[]> {
  'use cache'
  cacheTag('fdr-data', `gw-range-${gameweeks}`);
  cacheLife('static' as any);

  const [events, teams, fixtures] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapTeams(),
    getAllFixtures(),
  ]);

  // Get current gameweek
  const currentEvent = events.find((e: any) => e.is_current);
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
  const fdrData: FDRData[] = teams.map((team: any) => {
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
