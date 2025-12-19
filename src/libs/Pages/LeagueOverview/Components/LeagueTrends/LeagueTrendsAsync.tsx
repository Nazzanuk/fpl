import { Suspense } from 'react';
import { getLeagueTrends } from '../../../../Fpl/Services/AnalyticsEngine';
import { LeagueTrendsContent } from './LeagueTrendsContent';
import styles from './LeagueTrends.module.css';

type Props = {
  leagueId: number;
};

export const LeagueTrendsAsync = (props: Props) => {
  return (
    <Suspense fallback={<LeagueTrendsSkeleton />}>
      <LeagueTrendsInner {...props} />
    </Suspense>
  );
};

const LeagueTrendsSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.skeletonChart} />
      <div className={styles.skeletonLegend} />
    </div>
  );
};

const LeagueTrendsInner = async ({ leagueId }: Props) => {
  const trends = await getLeagueTrends(leagueId);

  return <LeagueTrendsContent trends={trends} />;
};
