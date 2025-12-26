import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getGameweekStatus } from '../../../../Fpl/Utils/GameweekStatus';
import { buildLiveTable } from '../../../../Fpl/Services/FPLEngine';
import { StandingsListServer } from './StandingsListServer';
import styles from './StandingsList.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const StandingsAsync = (props: PageProps) => {
  return (
    <Suspense fallback={<StandingsAsyncSkeleton />}>
      <StandingsAsyncInner {...props} />
    </Suspense>
  );
};

const StandingsAsyncSkeleton = () => (
  <div className={styles.list}>
    <div className={styles.tableHeader}>
      <div className={styles.tableHeaderCell}>Pos</div>
      <div className={styles.tableHeaderCell}>Team</div>
      <div className={styles.tableHeaderCell}>GW Pts</div>
      <div className={styles.tableHeaderCell}>Total</div>
    </div>
    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <div key={i} className={styles.skeletonRow}>
        <div className={styles.skeletonRank} />
        <div className={styles.skeletonInfo} />
        <div className={styles.skeletonPoints} />
        <div className={styles.skeletonTotal} />
      </div>
    ))}
  </div>
);

const StandingsAsyncInner = async ({ params }: PageProps) => {
  'use cache'
  const { id } = await params;

  cacheTag('standings', `league-${id}`);

  const { isLive } = await getGameweekStatus();
  cacheLife(isLive ? 'live' : 'gameweek' as any);

  const leagueId = parseInt(id, 10);
  const scores = await buildLiveTable(leagueId);

  return (
    <StandingsListServer
      leagueId={leagueId}
      scores={scores}
    />
  );
};
