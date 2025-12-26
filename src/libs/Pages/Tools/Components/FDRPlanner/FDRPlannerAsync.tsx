import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getFDRData } from '../../../../Fpl/Services/AnalyticsEngine';
import { FDRPlannerContent } from './FDRPlannerContent';
import styles from './FDRPlanner.module.css';

export const FDRPlannerAsync = () => {
  return (
    <Suspense fallback={<FDRPlannerSkeleton />}>
      <FDRPlannerInner />
    </Suspense>
  );
};

const FDRPlannerSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.skeletonLegend} />
      <div className={styles.skeletonGrid} />
    </div>
  );
};

const FDRPlannerInner = async () => {
  'use cache'
  cacheTag('fdr-planner');
  cacheLife('static' as any);

  const fdrData = await getFDRData(6);

  return <FDRPlannerContent teams={fdrData} />;
};
