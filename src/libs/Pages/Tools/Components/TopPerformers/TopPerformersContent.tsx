'use client';

import { useState } from 'react';
import type { TopPlayer } from '../../../../Fpl/Services/AnalyticsEngine';
import styles from './TopPerformers.module.css';

type Props = {
  data: {
    byPoints: TopPlayer[];
    byForm: TopPlayer[];
    byValue: TopPlayer[];
    differentials: TopPlayer[];
  };
};

type TabType = 'points' | 'form' | 'value' | 'differentials';

export const TopPerformersContent = ({ data }: Props) => {
  const [activeTab, setActiveTab] = useState<TabType>('points');

  const getPlayers = () => {
    switch (activeTab) {
      case 'form': return data.byForm;
      case 'value': return data.byValue;
      case 'differentials': return data.differentials;
      default: return data.byPoints;
    }
  };

  const players = getPlayers();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Top Performers</h2>
        <span className={styles.subtitle}>Best Players This Season</span>
      </div>

      <div className={styles.tabs}>
        <button
          className={styles.tab}
          data-active={activeTab === 'points'}
          onClick={() => setActiveTab('points')}
        >
          By Points
        </button>
        <button
          className={styles.tab}
          data-active={activeTab === 'form'}
          onClick={() => setActiveTab('form')}
        >
          By Form
        </button>
        <button
          className={styles.tab}
          data-active={activeTab === 'value'}
          onClick={() => setActiveTab('value')}
        >
          Best Value
        </button>
        <button
          className={styles.tab}
          data-active={activeTab === 'differentials'}
          onClick={() => setActiveTab('differentials')}
        >
          Differentials
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Price</th>
              <th>Pts</th>
              <th>Form</th>
              <th>Own%</th>
              <th>G</th>
              <th>A</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => (
              <tr key={player.id}>
                <td className={styles.rankCell}>{idx + 1}</td>
                <td className={styles.playerCell}>
                  <span className={styles.playerName}>{player.webName}</span>
                  <span className={styles.playerMeta}>
                    {player.teamShortName} · {player.position}
                  </span>
                </td>
                <td className={styles.priceCell}>£{player.price.toFixed(1)}</td>
                <td className={styles.pointsCell}>{player.totalPoints}</td>
                <td className={styles.formCell} data-form={getFormLevel(player.form)}>
                  {player.form}
                </td>
                <td className={styles.ownCell}>{player.selectedByPercent}%</td>
                <td>{player.goalsScored}</td>
                <td>{player.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getFormLevel = (form: string): 'high' | 'medium' | 'low' => {
  const val = parseFloat(form);
  if (val >= 6) return 'high';
  if (val >= 4) return 'medium';
  return 'low';
};
