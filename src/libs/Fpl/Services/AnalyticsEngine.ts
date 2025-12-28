/**
 * Analytics Engine - Re-export barrel for backward compatibility
 * Actual implementations in ./Analytics/
 */

export { getLeagueTrends, type LeagueTrend } from './Analytics/TrendsEngine';
export { getManagerHistoryData, type ManagerHistoryData } from './Analytics/ManagerHistoryEngine';
export { getPlayerStatsAggregate } from './Analytics/PlayerStatsEngine';
export { getChipRecommendations, type ChipRecommendation } from './Analytics/ChipRecommendationsEngine';
export { getFDRData, type FDRData } from './Analytics/FDREngine';
export {
  getTopPerformers,
  getPriceChangePlayers,
  type TopPlayer,
  type TopPerformersData,
  type PriceChangePlayer,
  type PriceChangeData
} from './Analytics/TopPerformersEngine';
