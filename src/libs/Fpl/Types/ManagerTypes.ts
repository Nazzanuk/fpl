/**
 * Manager-related type definitions
 */

// Types re-exported by PlayerTypes.ts
export interface TeamInfo {
  readonly id: number;
  readonly name: string;
  readonly shortName: string;
}

export type Position = 'GKP' | 'DEF' | 'MID' | 'FWD';
export type PlayerStatus = 'available' | 'doubtful' | 'injured' | 'suspended' | 'unavailable';

// Types used by LeagueRepository
export interface LeagueStats {
  readonly totalManagers: number;
  readonly averageScore: number;
  readonly highestScore: number;
}

// Types used by ManagerRepository
export interface ManagerDetail {
  readonly entry: ManagerEntry;
  readonly picks: ReadonlyArray<ManagerPick>;
  readonly chips: ReadonlyArray<ChipPlay>;
}

export interface ManagerEntry {
  readonly id: number;
  readonly name: string;
  readonly playerName: string;
}

export interface ManagerPick {
  readonly element: number;
  readonly position: number;
  readonly multiplier: number;
  readonly isCaptain: boolean;
  readonly isViceCaptain: boolean;
}

export interface ChipPlay {
  readonly name: string;
  readonly event: number;
}

export interface ManagerHistory {
  readonly current: ReadonlyArray<ManagerGameweek>;
  readonly chips: ReadonlyArray<ChipPlay>;
}

export interface ManagerGameweek {
  readonly event: number;
  readonly points: number;
  readonly totalPoints: number;
  readonly rank: number;
}

export interface Transfer {
  readonly element_in: number;
  readonly element_out: number;
  readonly event: number;
  readonly time: string;
}

export interface ManagerTeamPayload {
  readonly picks: ReadonlyArray<{
    readonly element: number;
    readonly position: number;
    readonly is_captain: boolean;
    readonly is_vice_captain: boolean;
    readonly multiplier: number;
  }>;
}

export interface LiveElementStats {
  readonly total_points: number;
  readonly stats?: any;
}
