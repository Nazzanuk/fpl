/**
 * Trends Engine - League trends and historical analytics
 * Analyzes manager performance trends across gameweeks
 */

import { cacheLife, cacheTag } from "next/cache";
import pLimit from "p-limit";
import {
	getLeagueData,
	getManagerHistory,
} from "../../Data/Client/FPLApiClient";

const limit = pLimit(5);

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

/**
 * Get league trends and analytics
 */
export async function getLeagueTrends(
	leagueId: number,
): Promise<LeagueTrend[]> {
	"use cache";
	cacheTag("league-trends", `league-${leagueId}`);
	cacheLife("gameweek" as any);

	const leagueData = await getLeagueData(leagueId);

	const managers = leagueData.standings.results;

	// Fetch manager histories
	const histories = await Promise.all(
		managers.map((m: any) => limit(() => getManagerHistory(m.entry))),
	);

	// Build trends array
	return managers.map((manager: any, mIdx: number) => {
		const history = histories[mIdx];

		return {
			managerId: manager.entry,
			managerName: manager.player_name,
			teamName: manager.entry_name,
			history: history.current.map((gw: any, gwIdx: number) => {
				// Calculate rank relative to other managers in the league at this gameweek
				const leagueRank = histories.reduce((rank, otherHist) => {
					const otherTotal = otherHist.current[gwIdx]?.total_points || 0;
					return otherTotal > gw.total_points ? rank + 1 : rank;
				}, 1);

				return {
					event: gw.event,
					points: gw.points,
					totalPoints: gw.total_points,
					rank: leagueRank,
				};
			}),
		};
	});
}
