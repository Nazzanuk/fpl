'use client';

import { useEffect, useState } from 'react';
import styles from './PlayerHoverCard.module.css';

type Props = {
  playerName: string;
  teamName: string;
  points: number;
  minutes: number;
  nextFixture: { opponent: string; isHome: boolean; difficulty: number } | null;
  position: { x: number; y: number };
};

export const PlayerHoverCard = ({ playerName, teamName, points, minutes, nextFixture, position }: Props) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Keep within viewport logic could go here
    setCoords({
      x: position.x + 15,
      y: position.y + 15
    });
  }, [position]);

  return (
    <div 
      className={styles.hoverCard}
      style={{ left: coords.x, top: coords.y }}
    >
      <div className={styles.playerName}>{playerName}</div>
      <div className={styles.teamName}>{teamName}</div>
      
      <div className={styles.divider} />
      
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Live Points</span>
        <span className={styles.statValue}>{minutes > 0 ? points : '-'}</span>
      </div>
      
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Minutes</span>
        <span className={styles.statValue}>{minutes}</span>
      </div>

      {nextFixture && (
        <>
          <div className={styles.divider} />
          <div className={styles.statLabel}>Next Fixture</div>
          <div className={styles.fixture}>
            <div 
              className={styles.fixtureDifficulty} 
              data-fdr={nextFixture.difficulty} 
            />
            <span className={styles.fixtureOpponent}>
              {nextFixture.opponent} ({nextFixture.isHome ? 'H' : 'A'})
            </span>
          </div>
        </>
      )}

      <div className={styles.clickHint}>
        <span className="material-symbols-sharp" style={{ fontSize: '10px' }}>info</span>
        Click for full stats
      </div>
    </div>
  );
};
