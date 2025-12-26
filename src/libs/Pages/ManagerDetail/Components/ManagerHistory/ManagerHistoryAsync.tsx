import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getManagerHistoryData } from '../../../../Fpl/Services/AnalyticsEngine';
import { ManagerHistoryContent } from './ManagerHistoryContent';
import styles from './ManagerHistory.module.css';

type Props = {
  leagueId: number;
  managerId: number;
};

export const ManagerHistoryAsync = (props: Props) => {
  return (
    <Suspense fallback={<ManagerHistorySkeleton />}>
      <ManagerHistoryInner {...props} />
    </Suspense>
  );
};

const ManagerHistorySkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.statsRow}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonStat} />
        ))}
      </div>
      <div className={styles.skeletonChart} />
      <div className={styles.skeletonTable} />
    </div>
  );
};

const ManagerHistoryInner = async ({ leagueId, managerId }: Props) => {
  'use cache'
  cacheTag('manager-history', `manager-${managerId}`);
  cacheLife('gameweek' as any);

  const historyData = await getManagerHistoryData(managerId, leagueId);

  if (!historyData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Unable to load manager history</div>
      </div>
    );
  }

  return <ManagerHistoryContent data={historyData} />;
};
