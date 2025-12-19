'use client';

import { useState } from 'react';
import styles from './PlayerStatsWidget.module.css';

type PlayerStat = {
  id: number;
  name: string;
  team: string;
  points: number;
};

type PlayerStatsClientProps = {
  currentGwStats: PlayerStat[];
  previousGwStats: PlayerStat[];
  currentGwId: number;
};

export const PlayerStatsClient = ({ currentGwStats, previousGwStats, currentGwId }: PlayerStatsClientProps) => {
  const [view, setView] = useState<'current' | 'previous'>('current');

  const stats = view === 'current' ? currentGwStats : previousGwStats;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button 
          type="button"
          className={`${styles.button} ${view === 'current' ? styles.active : ''}`}
          onClick={() => setView('current')}
        >
          Current (GW{currentGwId})
        </button>
        <button 
          type="button"
          className={`${styles.button} ${view === 'previous' ? styles.active : ''}`}
          onClick={() => setView('previous')}
          disabled={previousGwStats.length === 0}
        >
          Previous (GW{currentGwId - 1})
        </button>
      </div>

      <div className={styles.list}>
        {stats.map((player, index) => (
          <div key={player.id} className={styles.player}>
            <div className={styles.rank}>{index + 1}</div>
            <div className={styles.info}>
              <div className={styles.name}>{player.name}</div>
              <div className={styles.meta}>{player.team}</div>
            </div>
            <div className={styles.points}>{player.points}</div>
          </div>
        ))}
        {stats.length === 0 && <div className={styles.empty}>No data available</div>}
      </div>
    </div>
  );
};
