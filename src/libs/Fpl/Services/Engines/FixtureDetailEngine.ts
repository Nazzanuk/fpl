/**
 * Fixture Detail Engine - Detailed fixture information and statistics
 * Enriches fixture data with team and player information
 */

import { cacheLife, cacheTag } from "next/cache";
import {
	getBootstrapElements,
	getBootstrapTeams,
} from "../../Data/Client/BootstrapClient";
import { getAllFixtures } from "../../Data/Client/FPLApiClient";

/**
 * Get detailed fixture information
 */
export async function getFixtureDetail(fixtureId: number) {
	"use cache";
	cacheTag("fixture-detail", `fixture-${fixtureId}`);
	cacheLife("live"); // Always treat as potentially live for now

	const [teams, elements, allFixtures] = await Promise.all([
		getBootstrapTeams(),
		getBootstrapElements(),
		getAllFixtures(),
	]);

	const fixture = allFixtures.find((f: any) => f.id === fixtureId);
	if (!fixture) return null;

	const homeTeam = teams.find((t: any) => t.id === fixture.team_h);
	const awayTeam = teams.find((t: any) => t.id === fixture.team_a);

	// Helper to enrich stats
	const enrichStats = (stats: typeof fixture.stats) => {
		if (!stats) return [];
		return stats.map((stat) => ({
			identifier: stat.identifier,
			home: stat.h.map((item) => ({
				value: item.value,
				element: elements.find((e: any) => e.id === item.element),
			})),
			away: stat.a.map((item) => ({
				value: item.value,
				element: elements.find((e: any) => e.id === item.element),
			})),
		}));
	};

	return {
		id: fixture.id,
		event: fixture.event,
		kickoff_time: fixture.kickoff_time,
		finished: fixture.finished,
		finished_provisional: fixture.finished_provisional,
		started: fixture.started,
		minutes: fixture.minutes,
		homeTeam: {
			id: homeTeam?.id,
			name: homeTeam?.name,
			shortName: homeTeam?.short_name,
			code: homeTeam?.code,
			score: fixture.team_h_score,
		},
		awayTeam: {
			id: awayTeam?.id,
			name: awayTeam?.name,
			shortName: awayTeam?.short_name,
			code: awayTeam?.code,
			score: fixture.team_a_score,
		},
		stats: enrichStats(fixture.stats),
	};
}
