import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getPlayerStatsAggregate } from '../../Fpl/Services/FPLEngine';
import { PlayerComparisonTable } from './Components/PlayerComparisonTable';
import styles from './PlayersPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export const PlayersPage = (props: Props) => {
  return (
    <Suspense fallback={<PlayersPageSkeleton />}>
      <PlayersPageInner {...props} />
    </Suspense>
  );
};

const PlayersPageSkeleton = () => {
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

const PlayersPageInner = async ({ searchParams }: Props) => {
  'use cache'
  const resolvedParams = searchParams ? await searchParams : { page: undefined };
  const { page } = resolvedParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const pageSize = 20;
  const offset = (currentPage - 1) * pageSize;

  cacheTag('player-stats', `page-${currentPage}`);
  cacheLife('gameweek' as any);

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
