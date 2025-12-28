'use client';

import type { ManagerHistoryData } from '../../../Fpl/Services/AnalyticsEngine';
import { HistoryChart } from './HistoryChart';
import { HistoryTable } from './HistoryTable';
import { ChipsUsed } from './ChipsUsed';
import styles from '../HistoryPage.module.css';

type Props = {
  data: ManagerHistoryData;
};

export const HistoryContent = ({ data }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{data.managerName}</h2>
        <span className={styles.subtitle}>Season History</span>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.avgPoints}</span>
          <span className={styles.statLabel}>Avg Points</span>
        </div>
        <div className={styles.statCard} data-variant="positive">
          <span className={styles.statValue}>{data.bestGw.points}</span>
          <span className={styles.statLabel}>Best GW{data.bestGw.event}</span>
        </div>
        <div className={styles.statCard} data-variant="negative">
          <span className={styles.statValue}>{data.worstGw.points}</span>
          <span className={styles.statLabel}>Worst GW{data.worstGw.event}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{data.totalTransfersCost > 0 ? `-${data.totalTransfersCost}` : '0'}</span>
          <span className={styles.statLabel}>Transfer Costs</span>
        </div>
      </div>

      <ChipsUsed chips={data.chips} />
      <HistoryChart gameweeks={data.gameweeks} />
      <HistoryTable gameweeks={data.gameweeks} />
    </div>
  );
};
