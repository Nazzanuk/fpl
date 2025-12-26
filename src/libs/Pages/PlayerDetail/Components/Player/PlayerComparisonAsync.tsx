
import { Suspense } from 'react';
import { getPlayerStatsAggregate } from '../../../../Fpl/Services/FPLEngine';
import { PlayerComparisonTable } from './PlayerComparisonTable';
import styles from './PlayerComparisonTable.module.css';

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export const PlayerComparisonAsync = ({ searchParams }: Props) => {
  return (
    <Suspense fallback={<PlayerComparisonAsyncSkeleton />}>
      <PlayerComparisonAsyncInner searchParams={searchParams} />
    </Suspense>
  );
};

const PlayerComparisonAsyncSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.controls} style={{borderBottom: 'none'}}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)' }}>
          Player Statistics
        </h2>
      </div>
      <div className={styles.skeletonTable}>
        <div className={styles.skeletonHeader} />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    </div>
  );
};

const PlayerComparisonAsyncInner = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const pageSize = 20;
  const offset = (currentPage - 1) * pageSize;

  const { players, totalCount } = await getPlayerStatsAggregate(undefined, pageSize, offset);

  return (
    <div className={styles.container}>
      <div className={styles.controls} style={{borderBottom: 'none'}}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)' }}>
          Player Statistics
        </h2>
      </div>
      <PlayerComparisonTable 
        players={players} 
        totalCount={totalCount} 
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};
