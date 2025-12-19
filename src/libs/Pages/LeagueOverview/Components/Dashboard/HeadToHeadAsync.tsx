import { Suspense } from 'react';
import { buildLiveTable } from '../../../../Fpl/Services/FPLEngine';
import { HeadToHeadClient } from './HeadToHeadClient';
import styles from './HeadToHead.module.css';

type Props = {
  leagueId: number;
};

export const HeadToHeadAsync = (props: Props) => {
  return (
    <Suspense fallback={<HeadToHeadSkeleton />}>
      <HeadToHeadInner {...props} />
    </Suspense>
  );
};

const HeadToHeadSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.selectors}>
      <div className={styles.skeletonSelect} />
      <span className={styles.vs}>vs</span>
      <div className={styles.skeletonSelect} />
    </div>
    <div className={styles.skeletonComparison} />
  </div>
);

const HeadToHeadInner = async ({ leagueId }: Props) => {
  const scores = await buildLiveTable(leagueId);
  return <HeadToHeadClient leagueId={leagueId} scores={scores} />;
};
