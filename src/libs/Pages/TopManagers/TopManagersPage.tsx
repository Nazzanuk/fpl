import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getTopPerformers } from '../../Fpl/Services/AnalyticsEngine';
import { TopPerformersContent } from '../Tools/Components/TopPerformers/TopPerformersContent';
import styles from './TopManagersPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const TopManagersPage = (props: Props) => {
  return (
    <Suspense fallback={<TopManagersPageSkeleton />}>
      <TopManagersPageInner {...props} />
    </Suspense>
  );
};

const TopManagersPageSkeleton = () => {
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

const TopManagersPageInner = async ({ params }: Props) => {
  'use cache'
  await params;

  cacheTag('top-performers');
  cacheLife('gameweek' as any);

  const data = await getTopPerformers();

  return <TopPerformersContent data={data} />;
};
