import { cacheLife, cacheTag } from "next/cache";
import type { ElementSummaryResponse } from "../../Types/ElementSummaryResponse";
import type { EntryResponse } from "../../Types/EntryResponse";
import type { EntryTransfersResponse } from "../../Types/EntryTransfersResponse";
import type { EventLiveResponse } from "../../Types/EventLiveResponse";
import type { FixturesResponse } from "../../Types/FixturesResponse";
import type { LeagueStandingsResponse } from "../../Types/LeagueStandingsResponse";
import type { ManagerHistoryResponse } from "../../Types/ManagerHistoryResponse";
import type { ManagerPicksResponse } from "../../Types/ManagerPicksResponse";

const FPL_API_BASE = "https://fantasy.premierleague.com/api";
const USER_AGENT = "Mozilla/5.0 (compatible; FPLAlchemy/1.0)";

/**
 * Core fetch wrapper with Next.js caching and User-Agent spoofing
 */
async function fplFetch<T>(endpoint: string, revalidate = 60): Promise<T> {
	const url = `${FPL_API_BASE}${endpoint}`;

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": USER_AGENT,
			},
			next: { revalidate },
		});

		if (!response.ok) {
			throw new Error(
				`FPL API error: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	} catch (error) {
		console.error(`Failed to fetch ${endpoint}:`, error);
		throw error;
	}
}

/**
 * Bootstrap-static data (player/team metadata, current gameweek)
 * DEPRECATED: Use BootstrapClient split endpoints instead for better caching
 * @see src/libs/Fpl/Data/Client/BootstrapClient.ts
 */
export async function getBootstrapStatic() {
	return fplFetch<any>("/bootstrap-static/");
}

/**
 * League standings and manager list
 */
export async function getLeagueData(leagueId: number) {
	"use cache";
	cacheTag("league", `league-${leagueId}`);
	cacheLife("gameweek");
	return fplFetch<LeagueStandingsResponse>(
		`/leagues-classic/${leagueId}/standings/`,
	);
}

/**
 * Manager's picks for a specific gameweek
 */
export async function getManagerPicks(entryId: number, eventId: number) {
	"use cache";
	cacheTag("manager-picks", `manager-${entryId}`, `gw-${eventId}`);
	cacheLife("gameweek");
	return fplFetch<ManagerPicksResponse>(
		`/entry/${entryId}/event/${eventId}/picks/`,
	);
}

/**
 * Manager's history (all gameweeks)
 */
export async function getManagerHistory(entryId: number) {
	"use cache";
	cacheTag("manager-history", `manager-${entryId}`);
	cacheLife("historical");
	return fplFetch<ManagerHistoryResponse>(`/entry/${entryId}/history/`);
}

/**
 * Live gameweek data (real-time player scores)
 */
export async function getEventLive(eventId: number) {
	"use cache";
	cacheTag("live-scores", `gw-${eventId}`);
	cacheLife("live");
	return fplFetch<EventLiveResponse>(`/event/${eventId}/live/`, 30); // 30s cache for live data
}

/**
 * Fixtures for a specific gameweek
 */
export async function getFixtures(eventId: number) {
	"use cache";
	cacheTag("fixtures", `gw-${eventId}`);
	cacheLife("gameweek");
	return fplFetch<FixturesResponse>(`/fixtures/?event=${eventId}`);
}

/**
 * All fixtures (all gameweeks)
 */
export async function getAllFixtures() {
	"use cache";
	cacheTag("fixtures-all");
	cacheLife("static");
	return fplFetch<FixturesResponse>("/fixtures/");
}

/**
 * Player element summary (detailed player stats)
 */
export async function getElementSummary(elementId: number) {
	"use cache";
	cacheTag("element-summary", `player-${elementId}`);
	cacheLife("historical");
	return fplFetch<ElementSummaryResponse>(`/element-summary/${elementId}/`);
}

/**
 * Manager entry details
 */
export async function getEntry(entryId: number) {
	return fplFetch<EntryResponse>(`/entry/${entryId}/`);
}

/**
 * Manager transfers
 */
export async function getEntryTransfers(entryId: number) {
	return fplFetch<EntryTransfersResponse>(`/entry/${entryId}/transfers/`);
}
