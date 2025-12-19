import styles from '../StandingsList.module.css';

export const StandingsSkeleton = () => {
  return (
    <div className={styles.list}>
      {/* Header Skeleton */}
      <div className={styles.tableHeader}>
        <div className={styles.tableHeaderCell}>Rank</div>
        <div className={styles.tableHeaderCell}>Manager</div>
        <div className={`${styles.tableHeaderCell} ${styles.alignRight}`}>GW</div>
        <div className={`${styles.tableHeaderCell} ${styles.alignRight}`}>Total</div>
      </div>

      {/* Rows Skeletons */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={`standings-skeleton-${i}`} className={styles.skeletonRow}>
          <div className={styles.skeletonRank} />
          <div className={styles.skeletonInfo} />
          <div className={styles.skeletonPoints} />
          <div className={styles.skeletonTotal} />
        </div>
      ))}
    </div>
  );
};
