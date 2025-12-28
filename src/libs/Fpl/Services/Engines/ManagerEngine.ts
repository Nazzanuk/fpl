/**
 * Manager Engine - Detailed manager information and squad analysis
 * Fetches picks, league position, transfers, and calculates live scores
 */

import { cacheLife, cacheTag } from "next/cache";
import {
	getBootstrapElements,
	getBootstrapEvents,
	getBootstrapTeams,
} from "../../Data/Client/BootstrapClient";
import {
	getAllFixtures,
	getEntryTransfers,
	getEventLive,
	getLeagueData,
	getManagerHistory,
	getManagerPicks,
} from "../../Data/Client/FPLApiClient";
import { getGameweekStatus } from "../../Utils/GameweekStatus";

/**
 * Get simplified manager detail
 */
export async function getManagerDetailSimple(
	leagueId: number,
	managerId: number,
) {
	"use cache";
	cacheTag("manager-detail", `manager-${managerId}`, `league-${leagueId}`);

	const { isLive } = await getGameweekStatus();
	cacheLife(isLive ? "live" : ("gameweek" as any));

	const [events, teams, elements] = await Promise.all([
		getBootstrapEvents(),
		getBootstrapTeams(),
		getBootstrapElements(),
	]);

	const currentEvent = events.find((e: any) => e.is_current);

	if (!currentEvent) {
		throw new Error("No current gameweek found");
	}

	// Fetch manager picks, league standings, live stats, fixtures, history, and transfers
	const [picks, leagueData, liveStats, allFixtures, history, transfers] =
		await Promise.all([
			getManagerPicks(managerId, currentEvent.id),
			getLeagueData(leagueId),
			getEventLive(currentEvent.id),
			getAllFixtures(),
			getManagerHistory(managerId),
			getEntryTransfers(managerId),
		]);

	// Find this manager in the league
	const manager = leagueData.standings.results.find(
		(m: any) => m.entry === managerId,
	);
	const managers = leagueData.standings.results;

	// Calculate league statistics for this gameweek
	const gwScores = managers.map((m: any) => m.event_total);
	const avgPoints =
		gwScores.reduce((sum: number, s: number) => sum + s, 0) / managers.length;
	const highestPoints = Math.max(...gwScores);

	// Calculate gameweek rank
	const sortedByGwScore = [...managers].sort(
		(a: any, b: any) => b.event_total - a.event_total,
	);
	const gwRank =
		sortedByGwScore.findIndex((m: any) => m.entry === managerId) + 1;

	// Get next gameweek fixtures for each team
	const nextGwFixtures = allFixtures.filter(
		(f: any) => f.event === currentEvent.id + 1,
	);
	const getNextFixture = (teamId: number) => {
		const fixture = nextGwFixtures.find(
			(f: any) => f.team_h === teamId || f.team_a === teamId,
		);
		if (!fixture) return null;

		const isHome = fixture.team_h === teamId;
		const opponentId = isHome ? fixture.team_a : fixture.team_h;
		const opponent = teams.find((t: any) => t.id === opponentId);

		return {
			opponent: opponent?.short_name || "TBD",
			isHome,
			difficulty: isHome
				? fixture.team_h_difficulty
				: fixture.team_a_difficulty,
		};
	};

	// Enrich picks with player details, live stats, and next fixture
	const enrichedPicks = picks.picks.map((pick: any) => {
		const element = elements.find((e: any) => e.id === pick.element);
		const team = element ? teams.find((t: any) => t.id === element.team) : null;
		const liveData = liveStats.elements?.find(
			(el: any) => el.id === pick.element,
		);

		return {
			element: pick.element,
			position: pick.position,
			isCaptain: pick.is_captain,
			isViceCaptain: pick.is_vice_captain,
			multiplier: pick.multiplier,
			name: element?.web_name || "Unknown",
			teamCode: team?.code || 1,
			teamName: team?.short_name || "",
			elementType: element?.element_type || 1,
			points: liveData?.stats?.total_points || 0,
			minutes: liveData?.stats?.minutes || 0,
			nextFixture: team ? getNextFixture(team.id) : null,
		};
	});

	// Calculate live GW points with auto-subs
	const starters = enrichedPicks.filter((p: any) => p.position <= 11);
	const bench = enrichedPicks
		.filter((p: any) => p.position > 11)
		.sort((a: any, b: any) => a.position - b.position);

	// Build active squad with auto-subs
	let activeSquad = [...starters];

	// Process auto-subs/Bench Boost
	if (picks.active_chip === "bboost") {
		// Bench Boost: everyone counts, no subs needed
		activeSquad = [...enrichedPicks];
	} else {
		// Process auto-subs: replace starting players with 0 minutes
		bench.forEach((benchPlayer: any) => {
			// Only sub in players who actually played
			if (benchPlayer.minutes === 0) return;

			// Find a starting player with 0 minutes who can be replaced
			const subOutIndex = activeSquad.findIndex((starter: any) => {
				if (starter.minutes > 0) return false;

				// Can only sub if formation remains valid
				// GKP can only sub GKP, outfielders can sub outfielders
				if (starter.elementType === 1) return benchPlayer.elementType === 1;
				if (benchPlayer.elementType === 1) return false;
				return true;
			});

			if (subOutIndex !== -1) {
				activeSquad[subOutIndex] = benchPlayer;
			}
		});
	}

	// Sum points for active squad with multiplier
	const liveGWPoints = activeSquad.reduce(
		(sum: number, p: any) => sum + p.points * p.multiplier,
		0,
	);

	// Get transfer cost
	const transferCost = picks.entry_history?.event_transfers_cost || 0;

	// Calculate live total points (WITHOUT transfer cost - displayed separately)
	const previousTotal = (manager?.total || 0) - (manager?.event_total || 0);
	const liveTotalPoints = previousTotal + liveGWPoints;

	// Process recent transfers
	const recentTransfers = (transfers || [])
		.slice(0, 10) // Last 10 transfers
		.map((t: any) => {
			const pIn = elements.find((e: any) => e.id === t.element_in);
			const pOut = elements.find((e: any) => e.id === t.element_out);
			return {
				playerIn: {
					id: t.element_in,
					name: pIn?.web_name || "Unknown",
					teamCode: pIn?.team_code,
				},
				playerOut: {
					id: t.element_out,
					name: pOut?.web_name || "Unknown",
					teamCode: pOut?.team_code,
				},
				gameweek: t.event,
				time: t.time,
			};
		});

	return {
		managerId,
		managerName: manager?.entry_name || "Unknown Team",
		playerName: manager?.player_name || "Unknown Manager",
		playerRegionCode: "EN", // Placeholder
		liveTotalPoints,
		liveGWPoints,
		overallRank: manager?.rank || 0,
		totalPlayers: managers.length,
		currentGw: currentEvent.id,
		avgPoints: Math.round(avgPoints),
		highestPoints,
		gwRank,
		gwTransfers: picks.entry_history?.event_transfers || 0,
		transferCost,
		picks: enrichedPicks,
		chips: picks.active_chip,
		recentTransfers,
		history: history?.current || [],
	};
}
