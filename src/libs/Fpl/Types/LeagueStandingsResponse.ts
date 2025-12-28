/**
 * Response from /leagues-classic/{leagueId}/standings/
 */
export type LeagueStandingsResponse = {
	readonly standings: {
		readonly results: ReadonlyArray<{
			readonly id: number;
			readonly entry: number;
			readonly entry_name: string;
			readonly player_name: string;
			readonly rank: number;
			readonly last_rank: number;
			readonly total: number;
			readonly event_total: number;
		}>;
	};
	readonly league: {
		readonly id: number;
		readonly name: string;
		readonly created: string;
		readonly admin_entry: number;
	};
};
