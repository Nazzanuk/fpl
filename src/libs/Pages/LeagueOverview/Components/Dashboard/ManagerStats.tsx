import styles from './ManagerStats.module.css';

type Props = {
  overallPoints: number;
  overallRank: number;
  totalPlayers: number;
  gwPoints: number;
};

export const ManagerStats = ({ overallPoints, overallRank, totalPlayers, gwPoints }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Points & Rankings</h3>
      </div>
      <div className={styles.statsList}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Overall points</span>
          <span className={styles.statValue}>{overallPoints.toLocaleString()}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Overall rank</span>
          <span className={styles.statValue}>{overallRank.toLocaleString()}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Total players</span>
          <span className={styles.statValue}>{totalPlayers.toLocaleString()}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Gameweek points</span>
          <span className={styles.statValue}>{gwPoints}</span>
        </div>
      </div>
    </div>
  );
};
