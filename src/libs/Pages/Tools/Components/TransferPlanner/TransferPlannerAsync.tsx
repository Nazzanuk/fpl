import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getPriceChangePlayers } from '../../../../Fpl/Services/AnalyticsEngine';
import { TransferPlannerContent } from './TransferPlannerContent';
import styles from './TransferPlanner.module.css';

export const TransferPlannerAsync = () => {
  return (
    <Suspense fallback={<TransferPlannerSkeleton />}>
      <TransferPlannerInner />
    </Suspense>
  );
};

const TransferPlannerSkeleton = () => {
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

const TransferPlannerInner = async () => {
  'use cache'
  cacheTag('transfer-planner');
  cacheLife('gameweek' as any);

  const priceData = await getPriceChangePlayers();

  return <TransferPlannerContent rising={priceData.rising} falling={priceData.falling} />;
};
