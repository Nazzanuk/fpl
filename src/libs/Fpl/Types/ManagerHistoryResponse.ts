/**
 * Response from /entry/{entryId}/history/
 */
export type ManagerHistoryResponse = {
	readonly current: ReadonlyArray<{
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
	}>;
	readonly past: ReadonlyArray<{
		readonly season_name: string;
		readonly total_points: number;
		readonly rank: number;
	}>;
	readonly chips: ReadonlyArray<{
		readonly name: string;
		readonly time: string;
		readonly event: number;
	}>;
};
