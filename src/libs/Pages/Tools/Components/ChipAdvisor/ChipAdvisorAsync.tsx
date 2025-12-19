import { Suspense } from 'react';
import { getChipRecommendations } from '../../../../Fpl/Services/AnalyticsEngine';
import { getManagerHistory } from '../../../../Fpl/Data/Client/FPLApiClient';
import { ChipAdvisorContent } from './ChipAdvisorContent';
import styles from './ChipAdvisor.module.css';

type Props = {
  managerId: number;
};

export const ChipAdvisorAsync = (props: Props) => {
  return (
    <Suspense fallback={<ChipAdvisorSkeleton />}>
      <ChipAdvisorInner {...props} />
    </Suspense>
  );
};

const ChipAdvisorSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.skeletonCards}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  );
};

const ChipAdvisorInner = async ({ managerId }: Props) => {
  const [recommendations, history] = await Promise.all([
    getChipRecommendations(managerId),
    getManagerHistory(managerId),
  ]);

  const usedChips = new Set<string>(history.chips.map((c: any) => c.name));

  return (
    <ChipAdvisorContent
      recommendations={recommendations}
      usedChips={usedChips}
      chipsHistory={history.chips}
    />
  );
};
