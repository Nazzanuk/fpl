import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { cacheLife, cacheTag } from 'next/cache';
import { getManagerHistoryData } from '../../Fpl/Services/AnalyticsEngine';
import { HistoryContent } from './Components/HistoryContent';
import styles from './HistoryPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const HistoryPage = (props: Props) => {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryInner {...props} />
    </Suspense>
  );
};

const HistorySkeleton = () => {
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

const HistoryInner = async ({ params }: Props) => {
  'use cache';

  const [resolvedParams, cookieStore] = await Promise.all([
    params,
    cookies(),
  ]);

  const leagueId = parseInt(resolvedParams.id, 10);
  const managerId = cookieStore.get('currentlySelectedManagerId')?.value ||
                    cookieStore.get('fpl_manager_id')?.value;

  if (!managerId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Please select a manager to view their history
        </div>
      </div>
    );
  }

  const managerIdNum = parseInt(managerId, 10);

  cacheTag('manager-history', `manager-${managerIdNum}`);
  cacheLife('gameweek' as any);

  const historyData = await getManagerHistoryData(managerIdNum, leagueId);

  if (!historyData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Unable to load manager history</div>
      </div>
    );
  }

  return <HistoryContent data={historyData} />;
};
