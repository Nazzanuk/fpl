import type { PlayerDetail } from '../../../../Fpl/Types';
import styles from './PlayerSeasonStats.module.css';

type Props = {
  player: PlayerDetail;
};

export const PlayerSeasonStats = ({ player }: Props) => {
  const mainStats = [
    { label: 'Goals', value: player.goalsScored },
    { label: 'Assists', value: player.assists },
    { label: 'Clean Sheets', value: player.cleanSheets },
    { label: 'Bonus', value: player.bonus },
    { label: 'BPS', value: player.bps },
    { label: 'Minutes', value: player.minutes },
  ];

  const expectedStats = [
    { label: 'xG', value: player.expectedGoals },
    { label: 'xA', value: player.expectedAssists },
    { label: 'xGI', value: player.expectedGoalInvolvements },
    { label: 'xGC', value: player.expectedGoalsConceded },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Season Stats</h3>
      </div>
      <div className={styles.statsGrid}>
        {mainStats.map((stat, i) => (
          <div key={stat.label} className={styles.stat} data-highlight={i < 3}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.expectedSection}>
        <div className={styles.expectedTitle}>Expected Stats</div>
        <div className={styles.expectedGrid}>
          {expectedStats.map(stat => (
            <div key={stat.label} className={styles.expectedStat}>
              <span className={styles.expectedLabel}>{stat.label}</span>
              <span className={styles.expectedValue}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
