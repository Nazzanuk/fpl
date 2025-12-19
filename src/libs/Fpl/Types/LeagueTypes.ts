/**
 * League-related type definitions
 */

export interface LeagueStandings {
  readonly standings: {
    readonly results: ReadonlyArray<LeagueEntry>;
  };
  readonly league: LeagueInfo;
}

export interface LeagueEntry {
  readonly id: number;
  readonly entry: number;
  readonly entry_name: string;
  readonly player_name: string;
  readonly rank: number;
  readonly last_rank: number;
  readonly total: number;
  readonly event_total: number;
}

export interface LeagueInfo {
  readonly id: number;
  readonly name: string;
  readonly created: string;
  readonly admin_entry: number;
}
