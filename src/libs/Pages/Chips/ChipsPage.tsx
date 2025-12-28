import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getChipRecommendations } from '../../Fpl/Services/AnalyticsEngine';
import { getManagerHistory } from '../../Fpl/Data/Client/FPLApiClient';
import { ChipAdvisorContent } from '../Tools/Components/ChipAdvisor/ChipAdvisorContent';
import styles from './ChipsPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const ChipsPage = (props: Props) => {
  return (
    <Suspense fallback={<ChipsSkeleton />}>
      <ChipsInner {...props} />
    </Suspense>
  );
};

const ChipsSkeleton = () => {
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

const ChipsInner = async ({ params }: Props) => {
  const [, cookieStore] = await Promise.all([
    params,
    cookies(),
  ]);

  const managerId = cookieStore.get('currentlySelectedManagerId')?.value ||
                    cookieStore.get('fpl_manager_id')?.value;

  if (!managerId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Please select a manager to view chip recommendations
        </div>
      </div>
    );
  }

  const managerIdNum = parseInt(managerId, 10);

  const [recommendations, history] = await Promise.all([
    getChipRecommendations(managerIdNum),
    getManagerHistory(managerIdNum),
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
