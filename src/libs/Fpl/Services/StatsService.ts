/**
 * Stats Service - Statistical calculations and aggregations
 */

import { getBootstrapStatic, getLeagueManagers } from '../Data/Client/FPLApiClient';

export interface PlayerStat {
  element: number;
  count: number;
  totalManagers: number;
}

export interface LeagueStats {
  totalManagers: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  mostCaptained: PlayerStat[];
  mostTransferredIn: PlayerStat[];
  mostTransferredOut: PlayerStat[];
}

/**
 * Get league statistics
 */
export async function getLeagueStats(leagueId: number): Promise<LeagueStats> {
  const bootstrap = await getBootstrapStatic();
  const leagueData = await getLeagueManagers(leagueId);

  const managers = leagueData.standings.results;
  const scores = managers.map((m: any) => m.event_total);

  const totalManagers = managers.length;
  const averageScore = scores.reduce((sum: number, s: number) => sum + s, 0) / totalManagers;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Get most captained, transferred in/out from bootstrap (global stats)
  const mostCaptained = bootstrap.elements
    .sort((a: any, b: any) => b.selected_by_percent - a.selected_by_percent)
    .slice(0, 10)
    .map((el: any) => ({
      element: el.id,
      count: Math.round((el.selected_by_percent / 100) * totalManagers),
      totalManagers,
    }));

  const mostTransferredIn = bootstrap.elements
    .sort((a: any, b: any) => b.transfers_in_event - a.transfers_in_event)
    .slice(0, 10)
    .map((el: any) => ({
      element: el.id,
      count: el.transfers_in_event,
      totalManagers,
    }));

  const mostTransferredOut = bootstrap.elements
    .sort((a: any, b: any) => b.transfers_out_event - a.transfers_out_event)
    .slice(0, 10)
    .map((el: any) => ({
      element: el.id,
      count: el.transfers_out_event,
      totalManagers,
    }));

  return {
    totalManagers,
    averageScore,
    highestScore,
    lowestScore,
    mostCaptained,
    mostTransferredIn,
    mostTransferredOut,
  };
}
