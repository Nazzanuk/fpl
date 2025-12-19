'use client';

import { LiveManagerScore } from '../../../../Fpl/Types';
import styles from './StandingsList.module.css';

type Props = {
  scores: LiveManagerScore[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export const StandingsList = ({ scores, selectedId, onSelect }: Props) => {
  return (
    <div className={styles.list}>
      <div className={styles.tableHeader}>
        <div className={styles.tableHeaderCell}>Pos</div>
        <div className={styles.tableHeaderCell}>Team</div>
        <div className={`${styles.tableHeaderCell} ${styles.alignRight}`}>GW Pts</div>
        <div className={`${styles.tableHeaderCell} ${styles.alignRight}`}>Total</div>
      </div>
      {scores.map((score, index) => {
        const rank = index + 1;
        const isSelected = score.managerId === selectedId;
        const rankChange = score.rankChange || 0;

        return (
          <button
            key={score.managerId}
            className={`${styles.row} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelect(score.managerId)}
          >
            <div className={styles.rank}>
              <span className={styles.rankNum}>{rank}</span>
              {rankChange !== 0 && (
                <span className={`${styles.movement} ${rankChange > 0 ? styles.up : styles.down}`}>
                  {rankChange > 0 ? '▲' : '▼'}
                </span>
              )}
            </div>

            <div className={styles.info}>
              <div className={styles.managerName}>
                {score.managerName}
                {score.activeChip && (
                  <span className={styles.chip}>{formatChip(score.activeChip)}</span>
                )}
              </div>
              <div className={styles.playerName}>{score.playerName}</div>
            </div>

            <div className={styles.points}>
              <div className={styles.gwPoints}>
                {score.liveGWPoints}
                {score.transferCost != null && score.transferCost > 0 && (
                  <span className={styles.transferCost}>-{score.transferCost}pts</span>
                )}
              </div>
              <div className={styles.gwLabel}>Points</div>
            </div>

            <div className={styles.total}>
              <div className={styles.totalPoints}>{score.liveTotalPoints}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const formatChip = (chip: string): string => {
  const chipMap: Record<string, string> = {
    bboost: 'BB',
    '3xc': 'TC',
    wildcard: 'WC',
    freehit: 'FH',
  };
  return chipMap[chip] || chip.toUpperCase();
};
