/**
 * Live Table Engine - Real-time league standings with auto-substitutions
 * Calculates live scores by fetching manager picks and applying captain multipliers
 */

import { cacheLife, cacheTag } from "next/cache";
import pLimit from "p-limit";
import {
	getBootstrapElements,
	getBootstrapEvents,
} from "../../Data/Client/BootstrapClient";
import {
	getElementSummary,
	getEventLive,
	getLeagueData,
	getManagerPicks,
} from "../../Data/Client/FPLApiClient";
import { getGameweekStatus } from "../../Utils/GameweekStatus";
import { calculateTrimean } from "../../Utils/MathUtils";

const limit = pLimit(5); // Concurrency control - max 5 concurrent requests

/**
 * Fetch trimean for multiple players in parallel
 */
async function fetchPlayersTrimean(
	playerIds: number[],
): Promise<Map<number, number>> {
	const trimeanMap = new Map<number, number>();

	// Fetch element-summary for each player with concurrency control
	const summaries = await Promise.all(
		playerIds.map((id) =>
			limit(async () => {
				try {
					const summary = await getElementSummary(id);
					// Match "Secret Sauce" logic from AnalyticsEngine
					const validHistory = (summary.history || []).filter(
						(gw: any) => gw.minutes > 0,
					);
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
			}),
		),
	);

	summaries.forEach((res: any) => {
		if (res) trimeanMap.set(res.id, res.trimean);
	});

	return trimeanMap;
}

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
		id: number;
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
	// "use cache";
	// cacheTag("live-table", `league-${leagueId}`);

	// Dynamic cache life based on live status
	const { isLive } = await getGameweekStatus();
	// cacheLife(isLive ? "live" : ("gameweek" as any));

	// 1. Fetch current gameweek and player data using split endpoints for better caching
	const [events, elements] = await Promise.all([
		getBootstrapEvents(),
		getBootstrapElements(),
	]);

	const currentEvent = events.find((e: any) => e.is_current);

	if (!currentEvent) {
		throw new Error("No current gameweek found");
	}

	const eventId = currentEvent.id;

	// 2. Parallel fetch league standings + live element stats
	const [leagueData, liveStats] = await Promise.all([
		getLeagueData(leagueId),
		getEventLive(eventId),
	]);

	const managers = leagueData.standings.results;

	// 3. Fetch each manager's picks with concurrency limit (5 concurrent)
	const picksPromises = managers.map((manager: any) =>
		limit(() => getManagerPicks(manager.entry, eventId)),
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
	const liveScores: LiveScore[] = managers.map(
		(manager: any, index: number) => {
			const picks = allPicks[index];

			// Calculate live gameweek points from player stats
			let gameweekPoints = 0;

			if (picks?.picks) {
				// Separate starting 11 and bench
				const starting11 = picks.picks.filter((p: any) => p.position <= 11);
				const bench = picks.picks
					.filter((p: any) => p.position > 11)
					.sort((a: any, b: any) => a.position - b.position);

				// Helper to get player info
				const getPlayerInfo = (pick: any) => {
					const element = elements.find((el: any) => el.id === pick.element);
					const liveData = liveStats.elements?.find(
						(el: any) => el.id === pick.element,
					);
					return {
						pick,
						position: element?.element_type || 0, // 1=GKP, 2=DEF, 3=MID, 4=FWD
						minutes: liveData?.stats?.minutes || 0,
						points: liveData?.stats?.total_points || 0,
						stats: liveData?.stats,
					};
				};

				// Build active squad with auto-subs
				let activeSquad = starting11.map(getPlayerInfo);

				// Process auto-subs/Bench Boost
				if (picks.active_chip === "bboost") {
					// Bench Boost: everyone counts, no subs needed
					activeSquad = picks.picks.map(getPlayerInfo);
				} else {
					// Normal/other chips: replace starting players with 0 minutes
					bench.forEach((benchPick: any) => {
						const benchPlayer = getPlayerInfo(benchPick);

						// Only sub in players who actually played
						if (benchPlayer.minutes === 0) return;

						// Find a starting player with 0 minutes who can be replaced
						const subOutIndex = activeSquad.findIndex(
							(starter: {
								pick: any;
								position: number;
								minutes: number;
								points: number;
							}) => {
								if (starter.minutes > 0) return false;

								// Can only sub if formation remains valid
								// Simple check: GKP can only sub GKP, outfielders can sub outfielders
								if (starter.position === 1) return benchPlayer.position === 1; // GKP -> GKP only
								if (benchPlayer.position === 1) return false; // GKP can only replace GKP
								return true; // All other outfield positions can swap
							},
						);

						if (subOutIndex !== -1) {
							activeSquad[subOutIndex] = benchPlayer;
						}
					});
				}

				// Sum points for active squad with captain multiplier
				activeSquad.forEach(
					(player: {
						pick: any;
						position: number;
						minutes: number;
						points: number;
					}) => {
						gameweekPoints += player.points * (player.pick.multiplier || 1);
					},
				);
			}

			// Get transfer cost
			const transferCost = picks?.entry_history?.event_transfers_cost || 0;

			// Calculate live total points
			// manager.event_total already has transfer cost deducted
			// previousTotal = all points from previous gameweeks
			// Total shows points WITHOUT transfer cost deduction (transfer cost displayed separately)
			const previousTotal = (manager.total || 0) - (manager.event_total || 0);
			const totalPoints = previousTotal + gameweekPoints;

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
			let captain;
			if (captainPick) {
				const captainElement = elements.find(
					(el: any) => el.id === captainPick.element,
				);
				const captainStats = liveStats.elements?.find(
					(el: any) => el.id === captainPick.element,
				);
				captain = {
					id: captainPick.element,
					name: captainElement?.web_name || "Unknown",
					points:
						(captainStats?.stats?.total_points || 0) * captainPick.multiplier,
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
				activeChip: picks?.active_chip || undefined,
				transferCost,
				captain,
				teamTrimean,
			};
		},
	);

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
