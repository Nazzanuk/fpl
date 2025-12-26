import { Suspense } from 'react';
import { buildLiveTable } from '../../../Fpl/Services/FPLEngine';
import { ManagerRow } from './ManagerRow';
import { cacheLife, cacheTag } from 'next/cache';
import { getGameweekStatus } from '../../../Fpl/Utils/GameweekStatus';
import styles from './LiveTable.module.css';

type Props = {
  leagueId: number;
};

export const LiveTable = (props: Props) => {
  return (
    <Suspense fallback={<LiveTableSkeleton />}>
      <LiveTableInner {...props} />
    </Suspense>
  );
};

const LiveTableSkeleton = () => {
  return <div className={styles.skeleton} />;
};

const LiveTableInner = async ({ leagueId }: Props) => {
  'use cache'
  cacheTag('live-table', `league-${leagueId}`);
  
  const { isLive } = await getGameweekStatus();
  cacheLife(isLive ? 'live' : 'gameweek' as any);

  const scores = await buildLiveTable(leagueId);

  return (
    <div className={styles.container}>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHeader}>Rank</th>
            <th className={styles.tableHeader}>Manager</th>
            <th className={styles.tableHeader}>GW</th>
            <th className={styles.tableHeader}>Total</th>
            <th className={styles.tableHeader}>Trimean</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => (
            <ManagerRow key={score.managerId} score={score} rank={index + 1} leagueId={leagueId} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
