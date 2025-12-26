
import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getBestXI, getTransferRecommendations, getPlayerStatsAggregate } from '../../../../Fpl/Services/FPLEngine';
import { getManagerPicks } from '../../../../Fpl/Data/Client/FPLApiClient';
import { getBootstrapStatic } from '../../../../Fpl/Data/Client/FPLApiClient';
import { BestXIView } from './BestXI';
import styles from './BestXI.module.css';

type Props = {
  leagueId?: number;
  managerId?: number;
};

export const BestXIAsync = (props: Props) => {
  return (
    <Suspense fallback={<BestXIAsyncSkeleton />}>
      <BestXIAsyncInner {...props} />
    </Suspense>
  );
};

const BestXIAsyncSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonStats} />
      </div>
      <div className={styles.content}>
        <div className={styles.pitchSection}>
          <div className={styles.skeletonPitch} />
        </div>
        <div className={styles.recSection}>
          <div className={styles.skeletonRecs} />
        </div>
      </div>
    </div>
  );
};

const BestXIAsyncInner = async ({ leagueId, managerId }: Props) => {
  'use cache'
  cacheTag('best-xi', leagueId ? `league-${leagueId}` : 'all');
  cacheLife('gameweek');

  // 1. Fetch Bootstrap for current GW info
  const bootstrap = await getBootstrapStatic();
  const currentGw = bootstrap.events.find((e: any) => e.is_current);
  
  // Use current GW for picks - next GW picks don't exist until deadline passes
  const eventForPicks = currentGw?.id || 1;

  // 2. Calculate Best XI
  const bestXI = leagueId ? await getBestXI(leagueId) : { formation: '4-4-2', players: [], starting11: [], totalPoints: 0, totalValue: 0, totalCost: 0, totalTrimean: 0 };

  // 3. Calculate Recommendations & Manager Team Stats
  let recommendations: any[] = [];
  let managerTeam: any = null; // Type: BestXI | null

  if (managerId) {
    try {
      const team = await getManagerPicks(managerId, eventForPicks);

      recommendations = await getTransferRecommendations(managerId);

      // Get player stats for manager's specific players
      const starters = team.picks.filter((p: any) => p.position <= 11);
      const starterIds = starters.map((p: any) => p.element);
      const { players } = await getPlayerStatsAggregate(starterIds);

      // Create BestXI-compatible object for the manager's actual team
      const managerPlayers = starters.map((pick: any) => players.find((p: any) => p.id === pick.element)).filter(Boolean) as any[];

      managerTeam = {
        starting11: managerPlayers.sort((a, b) => {
           const posOrder: Record<string, number> = { 'GKP': 1, 'DEF': 2, 'MID': 3, 'FWD': 4 };
           return (posOrder[a.position] || 99) - (posOrder[b.position] || 99);
        }),
        bench: [],
        totalTrimean: managerPlayers.reduce((sum, p) => sum + p.trimean, 0),
        totalCost: managerPlayers.reduce((sum, p) => sum + p.cost, 0),
        activeChip: team.active_chip
      };

    } catch (e) {
      console.error('Failed to fetch manager team for recommendations:', e);
    }
  }

  return <BestXIView bestXI={bestXI} recommendations={recommendations} managerTeam={managerTeam} />;
};
