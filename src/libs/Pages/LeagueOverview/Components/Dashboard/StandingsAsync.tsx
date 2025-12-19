import { Suspense } from 'react';
import { buildLiveTable } from '../../../../Fpl/Services/FPLEngine';
import { StandingsListServer } from './StandingsListServer';
import styles from './StandingsList.module.css';

type StandingsAsyncProps = {
  leagueId: number;
  selectedManagerId?: number;
  view: string;
};

export const StandingsAsync = (props: StandingsAsyncProps) => {
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

const StandingsAsyncInner = async ({ leagueId, selectedManagerId, view }: StandingsAsyncProps) => {
  const scores = await buildLiveTable(leagueId);

  return (
    <StandingsListServer
      leagueId={leagueId}
      scores={scores}
      selectedManagerId={selectedManagerId}
      view={view}
    />
  );
};
