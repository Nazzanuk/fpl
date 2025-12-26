import styles from '@/libs/Pages/LeagueOverview/Components/Dashboard/StandingsList.module.css';

export default function StandingsLoading() {
  return (
    <div className={styles.list}>
      <div className={styles.tableHeader}>
        <div className={styles.tableHeaderCell}>Pos</div>
        <div className={styles.tableHeaderCell}>Team</div>
        <div className={styles.tableHeaderCell}>GW Pts</div>
        <div className={styles.tableHeaderCell}>Total</div>
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className={styles.skeletonRow}>
          <div className={styles.skeletonRank} />
          <div className={styles.skeletonInfo} />
          <div className={styles.skeletonPoints} />
          <div className={styles.skeletonTotal} />
        </div>
      ))}
    </div>
  );
}
