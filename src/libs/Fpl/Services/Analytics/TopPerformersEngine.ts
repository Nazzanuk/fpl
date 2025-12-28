/**
 * Top Performers Engine - Global FPL player performance analytics
 * Identifies top players by points, form, value, and price changes
 * Helps identify differentials and trending players
 */

import {
  getBootstrapTeams,
  getBootstrapElements,
} from '../../Data/Client/BootstrapClient';
import { cacheLife, cacheTag } from 'next/cache';

export interface TopPlayer {
  id: number;
  elementId: number;
  name: string;
  webName: string;
  teamId: number;
  teamShortName: string;
  position: string;
  price: number;
  totalPoints: number;
  points: number;
  form: string;
  selectedByPercent: number;
  goalsScored: number;
  assists: number;
}

export interface TopPerformersData {
  byPoints: TopPlayer[];
  byForm: TopPlayer[];
  byValue: TopPlayer[];
  differentials: TopPlayer[];
}

export interface PriceChangePlayer {
  id: number;
  elementId: number;
  name: string;
  webName: string;
  teamId: number;
  teamShortName: string;
  position: string;
  currentPrice: number;
  priceChange: number;
  form: string;
  selectedByPercent: number;
  netTransfers: number;
}

export interface PriceChangeData {
  rising: PriceChangePlayer[];
  falling: PriceChangePlayer[];
}

function getPositionName(elementType: number): string {
  switch (elementType) {
    case 1: return 'GKP';
    case 2: return 'DEF';
    case 3: return 'MID';
    case 4: return 'FWD';
    default: return 'MID';
  }
}

/**
 * Get top performers across all FPL
 */
export async function getTopPerformers(leagueId?: number): Promise<TopPerformersData> {
  'use cache'
  cacheTag('top-performers', leagueId ? `league-${leagueId}` : 'all');
  cacheLife('gameweek' as any);

  const [teams, elements] = await Promise.all([
    getBootstrapTeams(),
    getBootstrapElements(),
  ]);

  // Map elements to TopPlayer format
  const allPlayers: TopPlayer[] = elements.map((element: any) => {
    const team = teams.find((t: any) => t.id === element.team);

    return {
      id: element.id,
      elementId: element.id,
      name: `${element.first_name} ${element.second_name}`,
      webName: element.web_name,
      teamId: team?.id || 0,
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type),
      price: element.now_cost / 10,
      totalPoints: element.total_points,
      points: element.total_points,
      form: element.form,
      selectedByPercent: parseFloat(element.selected_by_percent),
      goalsScored: element.goals_scored,
      assists: element.assists,
    };
  });

  // Filter out players with 0 minutes (haven't played)
  const activePlayers = allPlayers.filter(p => p.totalPoints > 0);

  // By Points - sort by total points
  const byPoints = [...activePlayers]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

  // By Form - sort by form (higher is better)
  const byForm = [...activePlayers]
    .filter(p => parseFloat(p.form) > 0)
    .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
    .slice(0, 20);

  // By Value - calculate points per cost ratio
  const byValue = [...activePlayers]
    .filter(p => p.price > 0)
    .sort((a, b) => (b.totalPoints / b.price) - (a.totalPoints / a.price))
    .slice(0, 20);

  // Differentials - low ownership (< 10%) with good form
  const differentials = [...activePlayers]
    .filter(p => p.selectedByPercent < 10 && parseFloat(p.form) > 0)
    .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
    .slice(0, 20);

  return {
    byPoints,
    byForm,
    byValue,
    differentials,
  };
}

/**
 * Get players with price changes
 */
export async function getPriceChangePlayers(): Promise<PriceChangeData> {
  'use cache'
  cacheTag('price-changes');
  cacheLife('gameweek' as any);

  const [teams, elements] = await Promise.all([
    getBootstrapTeams(),
    getBootstrapElements(),
  ]);

  // Map elements to PriceChangePlayer format
  const allPlayers: PriceChangePlayer[] = elements.map((element: any) => {
    const team = teams.find((t: any) => t.id === element.team);

    return {
      id: element.id,
      elementId: element.id,
      name: `${element.first_name} ${element.second_name}`,
      webName: element.web_name,
      teamId: team?.id || 0,
      teamShortName: team?.short_name || '',
      position: getPositionName(element.element_type),
      currentPrice: element.now_cost / 10,
      priceChange: element.cost_change_event / 10,
      form: element.form,
      selectedByPercent: parseFloat(element.selected_by_percent),
      netTransfers: element.transfers_in_event - element.transfers_out_event,
    };
  });

  // Rising - positive price change this event OR high net transfers
  const rising = allPlayers
    .filter(p => p.priceChange > 0 || p.netTransfers > 50000)
    .sort((a, b) => {
      // Primary sort by price change, secondary by net transfers
      if (b.priceChange !== a.priceChange) {
        return b.priceChange - a.priceChange;
      }
      return b.netTransfers - a.netTransfers;
    })
    .slice(0, 20);

  // Falling - negative price change this event OR high negative net transfers
  const falling = allPlayers
    .filter(p => p.priceChange < 0 || p.netTransfers < -50000)
    .sort((a, b) => {
      // Primary sort by price change (most negative first), secondary by net transfers
      if (a.priceChange !== b.priceChange) {
        return a.priceChange - b.priceChange;
      }
      return a.netTransfers - b.netTransfers;
    })
    .slice(0, 20);

  return {
    rising,
    falling,
  };
}
