import { getBootstrapStatic } from '../Data/Client/FPLApiClient';
import { cacheLife, cacheTag } from 'next/cache';

export type GameweekStatus = 'live' | 'active' | 'finished' | 'preseason';

export interface GameweekInfo {
  status: GameweekStatus;
  currentGw: number;
  isLive: boolean;
}

/**
 * Get current gameweek status for conditional caching
 */
export async function getGameweekStatus(): Promise<GameweekInfo> {
  'use cache'
  cacheTag('gw-status');
  cacheLife('live'); // Check frequently (30s revalidate)
  
  try {
    const bootstrap = await getBootstrapStatic();
    const currentEvent = bootstrap.events.find((e: any) => e.is_current);
    
    if (!currentEvent) {
      return { status: 'preseason', currentGw: 0, isLive: false };
    }
    
    // Detect if matches are currently in progress
    // is_current is true during the GW, finished is true when all matches are DONE
    const isLive = currentEvent.is_current && !currentEvent.finished;
    
    return {
      status: isLive ? 'live' : currentEvent.finished ? 'finished' : 'active',
      currentGw: currentEvent.id,
      isLive,
    };
  } catch (error) {
    console.error('Failed to get gameweek status:', error);
    return { status: 'active', currentGw: 1, isLive: false };
  }
}
