/**
 * Differentials Engine - Unique and missing player analysis
 * Identifies players that differentiate a manager from the league average
 */

import { cacheLife, cacheTag } from "next/cache";
import pLimit from "p-limit";
import {
	getBootstrapElements,
	getBootstrapEvents,
	getBootstrapTeams,
} from "../../Data/Client/BootstrapClient";
import { getLeagueData, getManagerPicks } from "../../Data/Client/FPLApiClient";

const limit = pLimit(5); // Concurrency control - max 5 concurrent requests

/**
 * Get differential players in a league (unique and missing)
 */
export async function getDifferentials(leagueId: number, managerId: number) {
	"use cache";
	cacheTag("differentials", `league-${leagueId}`, `manager-${managerId}`);
	cacheLife("gameweek" as any);

	const [events, teams, elements] = await Promise.all([
		getBootstrapEvents(),
		getBootstrapTeams(),
		getBootstrapElements(),
	]);

	const currentEvent = events.find((e: any) => e.is_current);

	if (!currentEvent) {
		throw new Error("No current gameweek found");
	}

	const leagueData = await getLeagueData(leagueId);
	const managers = leagueData.standings.results;

	// Fetch all manager picks
	const allPicks = await Promise.all(
		managers.map((m: any) =>
			limit(() => getManagerPicks(m.entry, currentEvent.id)),
		),
	);

	// Get the specific manager's picks
	const managerIndex = managers.findIndex((m: any) => m.entry === managerId);
	const managerPicks = managerIndex >= 0 ? allPicks[managerIndex] : null;
	const managerPlayerIds = new Set(
		managerPicks?.picks.map((p: any) => p.element) || [],
	);

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
		const element = elements.find((el: any) => el.id === elementId);
		const team = element ? teams.find((t: any) => t.id === element.team) : null;

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
			name: element ? element.web_name : "Unknown",
			teamName: team ? team.short_name : "",
			ownershipCount: count,
			ownershipPercent: (count / totalManagers) * 100,
			owners,
		};
	};

	// Unique: players manager has that few others have (< 30% ownership)
	const unique = Array.from(ownershipMap.entries())
		.filter(
			([elementId, count]) =>
				managerPlayerIds.has(elementId) && count / totalManagers < 0.3,
		)
		.map(([elementId, count]) => enrichPlayerData(elementId, count));

	// Missing: players many others have (> 50% ownership) that manager doesn't
	const missing = Array.from(ownershipMap.entries())
		.filter(
			([elementId, count]) =>
				!managerPlayerIds.has(elementId) && count / totalManagers > 0.5,
		)
		.map(([elementId, count]) => enrichPlayerData(elementId, count));

	return { unique, missing };
}
