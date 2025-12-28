/**
 * Response from /fixtures/?event={eventId} or /fixtures/
 */
export type FixturesResponse = ReadonlyArray<{
	readonly id: number;
	readonly event: number | null;
	readonly team_h: number;
	readonly team_a: number;
	readonly team_h_score: number | null;
	readonly team_a_score: number | null;
	readonly team_h_difficulty: number;
	readonly team_a_difficulty: number;
	readonly kickoff_time: string;
	readonly started: boolean;
	readonly finished: boolean;
	readonly finished_provisional: boolean;
	readonly minutes: number;
	readonly provisional_start_time: boolean;
	readonly pulse_id: number;
	readonly stats?: ReadonlyArray<{
		readonly identifier: string;
		readonly h: ReadonlyArray<{
			readonly value: number;
			readonly element: number;
		}>;
		readonly a: ReadonlyArray<{
			readonly value: number;
			readonly element: number;
		}>;
	}>;
}>;
