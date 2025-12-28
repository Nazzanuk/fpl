/**
 * Response from /entry/{entryId}/
 */
export type EntryResponse = {
	readonly id: number;
	readonly joined_time: string;
	readonly started_event: number;
	readonly favourite_team: number | null;
	readonly player_first_name: string;
	readonly player_last_name: string;
	readonly player_region_id: number;
	readonly player_region_name: string;
	readonly player_region_iso_code_short: string;
	readonly player_region_iso_code_long: string;
	readonly summary_overall_points: number;
	readonly summary_overall_rank: number;
	readonly summary_event_points: number;
	readonly summary_event_rank: number;
	readonly current_event: number;
	readonly leagues: {
		readonly classic: ReadonlyArray<{
			readonly id: number;
			readonly name: string;
			readonly short_name: string;
			readonly created: string;
			readonly closed: boolean;
			readonly rank: number | null;
			readonly max_entries: number | null;
			readonly league_type: string;
			readonly scoring: string;
			readonly start_event: number;
			readonly entry_rank: number;
			readonly entry_last_rank: number;
		}>;
	};
	readonly name: string;
	readonly name_change_blocked: boolean;
	readonly entered_events: ReadonlyArray<number>;
	readonly kit: string | null;
	readonly last_deadline_bank: number;
	readonly last_deadline_value: number;
	readonly last_deadline_total_transfers: number;
};
