/**
 * Game-related type definitions
 */

export interface Fixture {
	readonly id: number;
	readonly event: number | null;
	readonly team_h: number;
	readonly team_a: number;
	readonly team_h_score: number | null;
	readonly team_a_score: number | null;
	readonly team_h_difficulty?: number;
	readonly team_a_difficulty?: number;
	readonly kickoff_time: string;
	readonly started: boolean;
	readonly finished: boolean;
	readonly finished_provisional: boolean;
	readonly minutes?: number;
}

export interface BootstrapStatic {
	readonly events: Array<{
		readonly id: number;
		readonly name: string;
		readonly deadline_time: string;
		readonly is_current: boolean;
		readonly is_next: boolean;
		readonly is_previous: boolean;
		readonly finished: boolean;
	}>;
	readonly teams: Array<{
		readonly id: number;
		readonly name: string;
		readonly short_name: string;
		readonly code: number;
	}>;
	readonly elements: any[];
}
