/**
 * Response from /entry/{entryId}/event/{eventId}/picks/
 */
export type ManagerPicksResponse = {
	readonly picks: ReadonlyArray<{
		readonly element: number;
		readonly position: number;
		readonly is_captain: boolean;
		readonly is_vice_captain: boolean;
		readonly multiplier: number;
	}>;
	readonly active_chip: string | null;
	readonly entry_history: {
		readonly event: number;
		readonly points: number;
		readonly total_points: number;
		readonly rank: number;
		readonly rank_sort: number;
		readonly overall_rank: number;
		readonly bank: number;
		readonly value: number;
		readonly event_transfers: number;
		readonly event_transfers_cost: number;
		readonly points_on_bench: number;
	};
};
