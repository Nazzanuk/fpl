/**
 * Response from /event/{eventId}/live/
 */
export type EventLiveResponse = {
	readonly elements: ReadonlyArray<{
		readonly id: number;
		readonly stats: {
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
			readonly in_dreamteam: boolean;
		};
		readonly explain: ReadonlyArray<{
			readonly fixture: number;
			readonly stats: ReadonlyArray<{
				readonly identifier: string;
				readonly points: number;
				readonly value: number;
			}>;
		}>;
	}>;
};
