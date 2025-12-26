import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getGameweekStatus } from '../../../../Fpl/Utils/GameweekStatus';
import { buildLiveTable } from '../../../../Fpl/Services/FPLEngine';
import { LeagueSummaryServer } from './LeagueSummaryServer';
import styles from './Dashboard.module.css';

type Props = {
  leagueId: number;
};

export const LeagueSummaryAsync = (props: Props) => {
  return (
    <Suspense fallback={<LeagueSummarySkeleton />}>
      <LeagueSummaryAsyncInner {...props} />
    </Suspense>
  );
};

const LeagueSummarySkeleton = () => (
  <div className={styles.leagueSummary}>
    <div className={styles.summaryHeader}>
      <div className={styles.skeletonTitle} style={{ height: '24px', width: '200px', backgroundColor: 'var(--surface)', borderRadius: '4px' }} />
    </div>
    
    <div className={styles.summaryGrid}>
      {[1, 2, 3].map(i => (
        <div key={i} className={styles.summaryCard}>
          <div style={{ height: '40px', width: '60px', backgroundColor: 'var(--surface-dim)', marginBottom: '8px', borderRadius: '4px' }} />
          <div style={{ height: '12px', width: '100px', backgroundColor: 'var(--surface-dim)', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  </div>
);

const LeagueSummaryAsyncInner = async ({ leagueId }: Props) => {
  'use cache'
  cacheTag('league-summary', `league-${leagueId}`);
  
  const { isLive } = await getGameweekStatus();
  cacheLife(isLive ? 'live' : 'gameweek' as any);

  const scores = await buildLiveTable(leagueId);
  return <LeagueSummaryServer scores={scores} leagueId={leagueId} />;
};
