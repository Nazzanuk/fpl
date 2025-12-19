'use client';

import { useState } from 'react';
import type { PriceChangePlayer } from '../../../../Fpl/Services/AnalyticsEngine';
import styles from './TransferPlanner.module.css';

type Props = {
  rising: PriceChangePlayer[];
  falling: PriceChangePlayer[];
};

export const TransferPlannerContent = ({ rising, falling }: Props) => {
  const [activeTab, setActiveTab] = useState<'rising' | 'falling'>('rising');
  const players = activeTab === 'rising' ? rising : falling;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Price Changes</h2>
        <span className={styles.subtitle}>Transfer Trends This Gameweek</span>
      </div>

      <div className={styles.tabs}>
        <button
          className={styles.tab}
          data-active={activeTab === 'rising'}
          onClick={() => setActiveTab('rising')}
        >
          <span className={styles.tabIcon}>▲</span>
          Rising
        </button>
        <button
          className={styles.tab}
          data-active={activeTab === 'falling'}
          onClick={() => setActiveTab('falling')}
        >
          <span className={styles.tabIcon}>▼</span>
          Falling
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Price</th>
              <th>Form</th>
              <th>Selected</th>
              <th>Net Transfers</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td className={styles.playerCell}>
                  <span className={styles.playerName}>{player.webName}</span>
                  <span className={styles.playerMeta}>
                    {player.teamShortName} · {player.position}
                  </span>
                </td>
                <td className={styles.priceCell}>
                  <span className={styles.price}>£{player.currentPrice.toFixed(1)}</span>
                  {player.priceChange !== 0 && (
                    <span
                      className={styles.priceChange}
                      data-direction={player.priceChange > 0 ? 'up' : 'down'}
                    >
                      {player.priceChange > 0 ? '+' : ''}{player.priceChange.toFixed(1)}
                    </span>
                  )}
                </td>
                <td className={styles.formCell}>{player.form}</td>
                <td className={styles.selectedCell}>{player.selectedByPercent}%</td>
                <td className={styles.transfersCell}>
                  <span
                    className={styles.netTransfers}
                    data-direction={player.netTransfers > 0 ? 'up' : 'down'}
                  >
                    {player.netTransfers > 0 ? '+' : ''}
                    {formatNumber(player.netTransfers)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatNumber = (num: number): string => {
  const abs = Math.abs(num);
  if (abs >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};
