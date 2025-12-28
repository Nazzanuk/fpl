/**
 * Ownership Engine - League-wide player ownership statistics
 * Calculates ownership percentages and captain counts across all league managers
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
 * Get league-wide player ownership
 */
export async function getLeaguePlayerOwnership(leagueId: number) {
	"use cache";
	cacheTag("ownership", `league-${leagueId}`);
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

	// Count player ownership with captain data
	const ownershipMap = new Map<
		number,
		{ owners: any[]; captainCount: number }
	>();

	allPicks.forEach((picks: any, index: number) => {
		const manager = managers[index];

		picks.picks.forEach((pick: any) => {
			const data = ownershipMap.get(pick.element) || {
				owners: [],
				captainCount: 0,
			};

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
		const element = elements.find((el: any) => el.id === elementId);
		const team = element ? teams.find((t: any) => t.id === element.team) : null;

		return {
			elementId,
			name: element ? element.web_name : "Unknown",
			teamName: team ? team.short_name : "",
			owners: data.owners,
			ownershipPercent: (data.owners.length / totalManagers) * 100,
			captainCount: data.captainCount,
		};
	});
}
