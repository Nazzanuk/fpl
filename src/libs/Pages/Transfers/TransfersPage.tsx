import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getPriceChangePlayers } from '../../Fpl/Services/AnalyticsEngine';
import { TransferPlannerContent } from '../Tools/Components/TransferPlanner/TransferPlannerContent';
import styles from './TransfersPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const TransfersPage = (props: Props) => {
  return (
    <Suspense fallback={<TransfersPageSkeleton />}>
      <TransfersPageInner {...props} />
    </Suspense>
  );
};

const TransfersPageSkeleton = () => {
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

const TransfersPageInner = async ({ params }: Props) => {
  'use cache'
  await params;

  cacheTag('transfer-planner');
  cacheLife('gameweek' as any);

  const priceData = await getPriceChangePlayers();

  return <TransferPlannerContent rising={priceData.rising} falling={priceData.falling} />;
};
