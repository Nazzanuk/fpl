/**
 * Recommendation Engine - Transfer and team recommendations
 */

import { getBestXI as getBestXIFromEngine, getTransferRecommendations as getTransferRecsFromEngine } from './FPLEngine';

export interface BestXI {
  formation: string;
  players: any[];
  starting11: any[];
  totalPoints: number;
  totalValue: number;
  totalCost: number;
  totalTrimean: number;
}

export interface RecommendedTransfer {
  playerOut: any; // Player object with webName, trimean, cost, etc.
  playerIn: any;  // Player object with webName, trimean, cost, etc.
  reasoning: string;
  priority: number;
  trimeanDiff: number;
  costDiff: number;
  fixtureDifficultyImpact: number; // Positive = easier fixtures for playerIn
  playerOutFDR: number; // Average FDR for next 3 GWs (lower is better)
  playerInFDR: number; // Average FDR for next 3 GWs (lower is better)
  effectivenessScore: number; // Combined trimean + fixture score for sorting
}

/**
 * Get best XI recommendation
 * Delegates to FPLEngine implementation
 */
export async function getBestXIRecommendation(leagueId: number): Promise<BestXI> {
  return getBestXIFromEngine(leagueId);
}

/**
 * Get transfer recommendations
 * Delegates to FPLEngine implementation
 */
export async function getTransferRecommendations(managerId: number): Promise<RecommendedTransfer[]> {
  return getTransferRecsFromEngine(managerId);
}
