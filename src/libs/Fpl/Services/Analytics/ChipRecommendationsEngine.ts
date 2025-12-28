/**
 * Chip Recommendations Engine - Smart FPL chip usage recommendations
 * Analyzes fixtures and team composition to suggest optimal chip timing
 * Supports: Bench Boost, Triple Captain, Free Hit, and Wildcard
 */

import { cacheLife, cacheTag } from "next/cache";
import {
	getBootstrapElements,
	getBootstrapEvents,
} from "../../Data/Client/BootstrapClient";
import {
	getAllFixtures,
	getManagerHistory,
	getManagerPicks,
} from "../../Data/Client/FPLApiClient";

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

/**
 * Get chip recommendations for a manager based on team and fixtures
 */
export async function getChipRecommendations(
	managerId: number,
): Promise<ChipRecommendation[]> {
	"use cache";
	cacheTag("chip-recommendations", `manager-${managerId}`);
	cacheLife("gameweek" as any);

	const [events, history, fixtures, elements] = await Promise.all([
		getBootstrapEvents(),
		getManagerHistory(managerId),
		getAllFixtures(),
		getBootstrapElements(),
	]);

	const currentEvent = events.find((e: any) => e.is_current);
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
		managerPlayers = [...(picks.picks || [])];
	} catch {
		// If current GW picks not available, continue without them
	}

	// Upcoming fixtures for next 10 gameweeks
	const upcomingFixtures = fixtures.filter(
		(f: any) => f.event && f.event >= currentGw && f.event <= currentGw + 10,
	);

	// Bench Boost - recommend if not used
	if (!usedChips.includes("bboost")) {
		// Find gameweeks where bench would score well (easy fixtures)
		const benchBoostGws = [];

		for (let gw = currentGw; gw <= currentGw + 10; gw++) {
			const gwFixtures = upcomingFixtures.filter((f: any) => f.event === gw);

			// Calculate average difficulty for this gameweek
			const avgDifficulty =
				gwFixtures.length > 0
					? gwFixtures.reduce(
							(sum: number, f: any) =>
								sum + (f.team_h_difficulty + f.team_a_difficulty) / 2,
							0,
						) / gwFixtures.length
					: 3;

			if (avgDifficulty < 3) {
				benchBoostGws.push({ gw, difficulty: avgDifficulty });
			}
		}

		if (benchBoostGws.length > 0) {
			const bestGw = benchBoostGws.sort(
				(a, b) => a.difficulty - b.difficulty,
			)[0];
			recommendations.push({
				chipName: "Bench Boost",
				chip: "bboost",
				chipLabel: "Bench Boost",
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
	if (!usedChips.includes("3xc")) {
		const tripleCapGws = [];

		for (let gw = currentGw; gw <= currentGw + 10; gw++) {
			const gwFixtures = upcomingFixtures.filter((f: any) => f.event === gw);

			// Find easiest fixtures this gameweek
			const easyFixtures = gwFixtures.filter(
				(f: any) => f.team_h_difficulty <= 2 || f.team_a_difficulty <= 2,
			);

			if (easyFixtures.length > 0) {
				const avgDifficulty =
					easyFixtures.reduce(
						(sum: number, f: any) =>
							sum + Math.min(f.team_h_difficulty, f.team_a_difficulty),
						0,
					) / easyFixtures.length;

				tripleCapGws.push({
					gw,
					difficulty: avgDifficulty,
					count: easyFixtures.length,
				});
			}
		}

		if (tripleCapGws.length > 0) {
			const bestGw = tripleCapGws.sort(
				(a, b) => a.difficulty - b.difficulty,
			)[0];
			recommendations.push({
				chipName: "Triple Captain",
				chip: "3xc",
				chipLabel: "Triple Captain",
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
	if (!usedChips.includes("freehit")) {
		// Count fixtures per gameweek
		const fixturesByGw: Record<number, number> = {};
		upcomingFixtures.forEach((f: any) => {
			if (f.event) {
				fixturesByGw[f.event] = (fixturesByGw[f.event] || 0) + 1;
			}
		});

		// Find blank gameweeks (fewer fixtures) or double gameweeks (more fixtures)
		const avgFixtures =
			Object.values(fixturesByGw).reduce((a, b) => a + b, 0) /
			Object.keys(fixturesByGw).length;

		for (let gw = currentGw; gw <= currentGw + 10; gw++) {
			const fixtureCount = fixturesByGw[gw] || 0;

			// Double gameweek (more than 1.5x average) or blank gameweek (less than 0.5x average)
			if (
				fixtureCount > avgFixtures * 1.5 ||
				fixtureCount < avgFixtures * 0.5
			) {
				const isDouble = fixtureCount > avgFixtures;
				recommendations.push({
					chipName: "Free Hit",
					chip: "freehit",
					chipLabel: "Free Hit",
					gameweek: gw,
					recommendedGw: gw,
					reasoning: isDouble
						? `GW${gw} appears to be a double gameweek with ${fixtureCount} fixtures. Free Hit to maximize players with two matches.`
						: `GW${gw} looks like a blank gameweek with only ${fixtureCount} fixtures. Free Hit to field a full team.`,
					reason: isDouble
						? `GW${gw} double gameweek`
						: `GW${gw} blank gameweek`,
					score: isDouble ? 9 : 7,
					managerPlayers,
					fixtures: upcomingFixtures.filter((f: any) => f.event === gw),
				});
				break; // Only recommend one Free Hit opportunity
			}
		}
	}

	// Wildcard - general recommendation if team needs refresh
	if (!usedChips.includes("wildcard")) {
		// Check if many players are injured or out of form
		let injuredCount = 0;
		let poorFormCount = 0;

		if (managerPlayers.length > 0) {
			for (const pick of managerPlayers) {
				const element = elements.find((e: any) => e.id === pick.element);
				if (element) {
					if (element.status !== "a") injuredCount++;
					if (parseFloat(element.form) < 2) poorFormCount++;
				}
			}
		}

		if (injuredCount >= 3 || poorFormCount >= 5) {
			recommendations.push({
				chipName: "Wildcard",
				chip: "wildcard",
				chipLabel: "Wildcard",
				gameweek: currentGw + 1,
				recommendedGw: currentGw + 1,
				reasoning: `Your team needs refreshing with ${injuredCount} injured player(s) and ${poorFormCount} in poor form. Use Wildcard to rebuild.`,
				reason: "Team needs refreshing",
				score: Math.min(injuredCount + poorFormCount, 10),
				managerPlayers,
				fixtures: upcomingFixtures.filter(
					(f: any) => f.event === currentGw + 1,
				),
			});
		}
	}

	// Sort by score (highest first)
	return recommendations.sort((a, b) => b.score - a.score);
}
