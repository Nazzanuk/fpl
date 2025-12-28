/**
 * Manager History Engine - Manager performance analytics and history tracking
 * Provides detailed statistics and insights on individual manager performance
 */

import { cacheLife, cacheTag } from "next/cache";
import {
	getLeagueData,
	getManagerHistory,
} from "../../Data/Client/FPLApiClient";

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

/**
 * Get manager history data with analytics
 */
export async function getManagerHistoryData(
	managerId: number,
	leagueId?: number,
): Promise<ManagerHistoryData> {
	"use cache";
	cacheTag("manager-history-data", `manager-${managerId}`);
	cacheLife("gameweek" as any);

	const history = await getManagerHistory(managerId);

	// Fetch manager details if leagueId provided
	let managerName = "Manager";
	let teamName = "Team";

	if (leagueId) {
		const leagueData = await getLeagueData(leagueId);
		const manager = leagueData.standings.results.find(
			(m: any) => m.entry === managerId,
		);
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
	const avgPoints =
		current.length > 0
			? Math.round(
					current.reduce((sum: number, gw: any) => sum + gw.points, 0) /
						current.length,
				)
			: 0;

	const bestGw =
		current.length > 0
			? current.reduce(
					(best: any, gw: any) => (gw.points > best.points ? gw : best),
					current[0],
				)
			: { event: 0, points: 0 };

	const worstGw =
		current.length > 0
			? current.reduce(
					(worst: any, gw: any) => (gw.points < worst.points ? gw : worst),
					current[0],
				)
			: { event: 0, points: 0 };

	const totalTransfersCost = current.reduce(
		(sum: number, gw: any) => sum + (gw.eventTransfersCost || 0),
		0,
	);

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
