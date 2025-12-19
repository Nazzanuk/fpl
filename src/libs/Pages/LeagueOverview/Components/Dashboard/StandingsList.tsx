'use client';

import { useEffect, useRef } from 'react';
import { LiveManagerScore } from '../../../../Fpl/Types';
import styles from './StandingsList.module.css';

type Props = {
  scores: LiveManagerScore[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export const StandingsList = ({ scores, selectedId, onSelect }: Props) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      
      const currentIndex = scores.findIndex(s => s.managerId === selectedId);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowDown') {
        const nextIndex = Math.min(currentIndex + 1, scores.length - 1);
        onSelect(scores[nextIndex].managerId);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        const prevIndex = Math.max(currentIndex - 1, 0);
        onSelect(scores[prevIndex].managerId);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, scores, onSelect]);

  return (
    <div className={styles.list} ref={listRef}>
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
            type="button"
            className={`${styles.row} ${isSelected ? styles.selected : ''}`}
            onClick={() => onSelect(score.managerId)}
          >
            <div className={styles.rank}>
              <span className={styles.rankNum}>{rank}</span>
              {rankChange !== 0 && (
                <span className={`${styles.movement} ${rankChange > 0 ? styles.up : styles.down}`}>
                  <span 
                    className="material-symbols-sharp" 
                    style={{ fontSize: '12px' }}
                  >
                    {rankChange > 0 ? 'stat_1' : 'stat_minus_1'}
                  </span>
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
