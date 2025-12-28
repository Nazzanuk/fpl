/**
 * Response from /entry/{entryId}/transfers/
 */
export type EntryTransfersResponse = ReadonlyArray<{
	readonly element_in: number;
	readonly element_in_cost: number;
	readonly element_out: number;
	readonly element_out_cost: number;
	readonly entry: number;
	readonly event: number;
	readonly time: string;
}>;
