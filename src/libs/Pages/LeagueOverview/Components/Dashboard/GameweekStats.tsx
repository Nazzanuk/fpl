import styles from './GameweekStats.module.css';

type Props = {
  currentGw: number;
  avgPoints: number;
  highestPoints: number;
  totalPoints: number;
  gwRank: number;
  gwTransfers: number;
};

export const GameweekStats = (props: Props) => {
  const { currentGw, avgPoints, highestPoints, totalPoints, gwRank, gwTransfers } = props;

  return (
    <div className={styles.container}>
      <div className={styles.gwNav}>
        <button className={styles.navButton} type="button" disabled>
          <span className={styles.navIcon}>&#8249;</span>
        </button>
        <span className={styles.gwLabel}>Gameweek {currentGw}</span>
        <button className={styles.navButton} type="button" disabled>
          <span className={styles.navIcon}>&#8250;</span>
        </button>
      </div>
      <div className={styles.statsGrid}>
        <StatCard label="Average Points" value={avgPoints} />
        <StatCard label="Highest Points" value={highestPoints} hasArrow />
        <StatCard label="Total Points" value={totalPoints} isHighlight />
        <StatCard label="GW Rank" value={gwRank.toLocaleString()} />
        <StatCard label="Transfers" value={gwTransfers} hasArrow />
      </div>
    </div>
  );
};

type StatCardProps = {
  label: string;
  value: number | string;
  isHighlight?: boolean;
  hasArrow?: boolean;
};

const StatCard = ({ label, value, isHighlight, hasArrow }: StatCardProps) => (
  <div className={styles.statCard} data-highlight={isHighlight || undefined}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>
      {label}
      {hasArrow && <span className={styles.arrow}> &#8594;</span>}
    </span>
  </div>
);
