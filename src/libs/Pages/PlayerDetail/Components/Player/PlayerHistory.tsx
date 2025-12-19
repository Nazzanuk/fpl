import type { PlayerDetail } from '../../../../Fpl/Types';
import styles from './PlayerHistory.module.css';

type Props = {
  history: PlayerDetail['history'];
};

export const PlayerHistory = ({ history }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Form</h3>
      </div>
      {history.length === 0 ? (
        <div className={styles.empty}>No history available</div>
      ) : (
        <div className={styles.historyList}>
          <div className={styles.historyHeader}>
            <span className={styles.headerCell}>GW</span>
            <span className={styles.headerCell}>Opp</span>
            <span className={styles.headerCell}>Mins</span>
            <span className={styles.headerCell}>G</span>
            <span className={styles.headerCell}>A</span>
            <span className={styles.headerCell}>Pts</span>
          </div>
          {history.slice(0, 5).map(h => (
            <div key={h.gameweek} className={styles.historyRow}>
              <span className={`${styles.cell} ${styles.gameweek}`}>{h.gameweek}</span>
              <div className={`${styles.cell} ${styles.opponent}`}>
                <span>{h.opponentShort}</span>
                <span className={styles.venue}>{h.isHome ? 'H' : 'A'}</span>
              </div>
              <span className={`${styles.cell} ${styles.minutes}`}>{h.minutes}</span>
              <span className={styles.cell}>{h.goals}</span>
              <span className={styles.cell}>{h.assists}</span>
              <span
                className={`${styles.cell} ${styles.points}`}
                data-high={h.points >= 10}
              >
                {h.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
