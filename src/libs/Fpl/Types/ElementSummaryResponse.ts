/**
 * Response from /element-summary/{elementId}/
 */
export type ElementSummaryResponse = {
	readonly fixtures: ReadonlyArray<{
		readonly id: number;
		readonly event: number;
		readonly team_h: number;
		readonly team_a: number;
		readonly is_home: boolean;
		readonly difficulty: number;
		readonly kickoff_time: string;
	}>;
	readonly history: ReadonlyArray<{
		readonly element: number;
		readonly fixture: number;
		readonly opponent_team: number;
		readonly total_points: number;
		readonly was_home: boolean;
		readonly kickoff_time: string;
		readonly round: number;
		readonly minutes: number;
		readonly goals_scored: number;
		readonly assists: number;
		readonly clean_sheets: number;
		readonly goals_conceded: number;
		readonly own_goals: number;
		readonly penalties_saved: number;
		readonly penalties_missed: number;
		readonly yellow_cards: number;
		readonly red_cards: number;
		readonly saves: number;
		readonly bonus: number;
		readonly bps: number;
		readonly influence: string;
		readonly creativity: string;
		readonly threat: string;
		readonly ict_index: string;
		readonly value: number;
		readonly transfers_balance: number;
		readonly selected: number;
		readonly transfers_in: number;
		readonly transfers_out: number;
	}>;
	readonly history_past: ReadonlyArray<{
		readonly season_name: string;
		readonly element_code: number;
		readonly start_cost: number;
		readonly end_cost: number;
		readonly total_points: number;
		readonly minutes: number;
		readonly goals_scored: number;
		readonly assists: number;
		readonly clean_sheets: number;
		readonly goals_conceded: number;
		readonly own_goals: number;
		readonly penalties_saved: number;
		readonly penalties_missed: number;
		readonly yellow_cards: number;
		readonly red_cards: number;
		readonly saves: number;
		readonly bonus: number;
		readonly bps: number;
		readonly influence: string;
		readonly creativity: string;
		readonly threat: string;
		readonly ict_index: string;
	}>;
};
