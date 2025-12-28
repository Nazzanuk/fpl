/**
 * FPL Engine - Re-export barrel for backward compatibility
 * Actual implementations in ./Engines/
 */

export { buildLiveTable, type LiveScore } from './Engines/LiveTableEngine';
export { getManagerDetailSimple } from './Engines/ManagerEngine';
export { getDifferentials } from './Engines/DifferentialsEngine';
export { getLeaguePlayerOwnership } from './Engines/OwnershipEngine';
export { getBestXI, getPositionName } from './Engines/BestXIEngine';
export { getTransferRecommendations } from './Engines/TransferEngine';
export { getFixtureDetail } from './Engines/FixtureDetailEngine';

// Re-export from AnalyticsEngine for backward compatibility
export { getPlayerStatsAggregate } from './AnalyticsEngine';
