
import { Suspense } from 'react';
import { getPlayerStatsAggregate } from '../../../../Fpl/Services/FPLEngine';
import { PlayerComparisonTable } from './PlayerComparisonTable';
import styles from './PlayerComparisonTable.module.css';

export const PlayerComparisonAsync = () => {
  return (
    <Suspense fallback={<PlayerComparisonAsyncSkeleton />}>
      <PlayerComparisonAsyncInner />
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
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    </div>
  );
};

const PlayerComparisonAsyncInner = async () => {
  const players = await getPlayerStatsAggregate();

  return (
    <div className={styles.container}>
      {/* Re-using the container style from the module */}
      <div className={styles.controls} style={{borderBottom: 'none'}}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)' }}>
          Player Statistics
        </h2>
      </div>
      <PlayerComparisonTable players={players} />
    </div>
  );
};
