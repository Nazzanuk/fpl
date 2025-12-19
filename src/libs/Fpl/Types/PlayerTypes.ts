/**
 * Player-related type definitions
 */

import type { TeamInfo, Position, PlayerStatus } from './ManagerTypes';

export interface PlayerDetail {
  readonly id: number;
  readonly webName: string;
  readonly firstName: string;
  readonly secondName: string;
  readonly fullName: string;
  readonly team: TeamInfo;
  readonly teamCode: number;
  readonly teamName: string;
  readonly position: Position;
  readonly positionShort: string;
  readonly price: number;
  readonly status: PlayerStatus;
  readonly form: string;
  readonly totalPoints: number;
  readonly pointsPerGame: string;
  readonly selectedByPercent: string;
  readonly transfersIn: number;
  readonly transfersOut: number;
  readonly transfersInEvent: number;
  readonly transfersOutEvent: number;
  readonly minutes: number;
  readonly goalsScored: number;
  readonly assists: number;
  readonly cleanSheets: number;
  readonly goalsConceded: number;
  readonly bonus: number;
  readonly bps: number;
  readonly influence: string;
  readonly creativity: string;
  readonly threat: string;
  readonly ictIndex: string;
  readonly expectedGoals: string;
  readonly expectedAssists: string;
  readonly expectedGoalInvolvements: string;
  readonly expectedGoalsConceded: string;
  readonly news: string;
  readonly chanceOfPlaying: number | null;
  readonly currentGwPoints: number;
  readonly currentGwMinutes: number;
  readonly currentGwBonus: number;
  readonly currentGwBps: number;
  readonly fixtures: ReadonlyArray<PlayerFixture>;
  readonly history: ReadonlyArray<PlayerGameweekHistory>;
  readonly leagueOwnership: PlayerLeagueOwnership;
}

export interface PlayerFixture {
  readonly eventId: number;
  readonly eventName: string;
  readonly opponent: string;
  readonly opponentShort: string;
  readonly isHome: boolean;
  readonly difficulty: number;
  readonly kickoffTime: string;
}

export interface PlayerGameweekHistory {
  readonly gameweek: number;
  readonly opponent: string;
  readonly opponentShort: string;
  readonly isHome: boolean;
  readonly points: number;
  readonly minutes: number;
  readonly goals: number;
  readonly assists: number;
  readonly bonus: number;
  readonly bps: number;
  readonly value: number;
}

export interface PlayerLeagueOwnership {
  readonly owners: ReadonlyArray<PlayerOwner>;
  readonly ownershipPercent: number;
  readonly captainCount: number;
}

export interface PlayerOwner {
  readonly managerId: number;
  readonly managerName: string;
  readonly isCaptain: boolean;
}

export interface PlayerOwnership {
  readonly elementId: number;
  readonly name: string;
  readonly teamName: string;
  readonly owners: ReadonlyArray<PlayerOwner>;
  readonly ownershipPercent: number;
}

export interface PlayerHistory {
  readonly current: ReadonlyArray<PlayerGameweekHistory>;
  readonly past: ReadonlyArray<PlayerSeasonHistory>;
}

export interface PlayerSeasonHistory {
  readonly seasonName: string;
  readonly totalPoints: number;
  readonly minutes: number;
  readonly goalsScored: number;
  readonly assists: number;
  readonly cleanSheets: number;
  readonly startCost: number;
  readonly endCost: number;
}

export interface PlayerStatSummary {
  readonly id: number;
  readonly webName: string;
  readonly teamName: string;
  readonly teamShortName: string;
  readonly position: string;
  readonly cost: number;
  readonly totalPoints: number;
  readonly averagePoints: number;
  readonly medianPoints: number;
  readonly trimean: number;
  readonly lastGwPoints: number;
  readonly matchesPlayed: number;
  readonly injuryStatus: string | null;
}

// Re-export shared types
export type { TeamInfo, Position, PlayerStatus } from './ManagerTypes';