import { Suspense } from 'react';
import { getTopPerformers } from '../../../../Fpl/Services/AnalyticsEngine';
import { TopPerformersContent } from './TopPerformersContent';
import styles from './TopPerformers.module.css';

export const TopPerformersAsync = () => {
  return (
    <Suspense fallback={<TopPerformersSkeleton />}>
      <TopPerformersInner />
    </Suspense>
  );
};

const TopPerformersSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.skeletonTabs} />
      <div className={styles.skeletonList} />
    </div>
  );
};

const TopPerformersInner = async () => {
  const data = await getTopPerformers();

  return <TopPerformersContent data={data} />;
};
