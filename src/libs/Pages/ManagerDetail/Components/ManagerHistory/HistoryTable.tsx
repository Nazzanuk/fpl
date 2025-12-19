'use client';

import styles from './ManagerHistory.module.css';

type GameweekData = {
  event: number;
  points: number;
  totalPoints: number;
  rank: number;
  overallRank: number;
  transfers: number;
  transfersCost: number;
};

type Props = {
  gameweeks: GameweekData[];
};

export const HistoryTable = ({ gameweeks }: Props) => {
  const sortedGws = [...gameweeks].reverse();

  return (
    <div className={styles.tableSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Gameweek Breakdown</span>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>GW</th>
              <th>Pts</th>
              <th>Total</th>
              <th>GW Rank</th>
              <th>Overall</th>
              <th>Transfers</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {sortedGws.map(gw => (
              <tr key={gw.event}>
                <td className={styles.gwCell}>{gw.event}</td>
                <td className={styles.pointsCell}>{gw.points}</td>
                <td>{gw.totalPoints.toLocaleString()}</td>
                <td>{gw.rank.toLocaleString()}</td>
                <td>{gw.overallRank.toLocaleString()}</td>
                <td>{gw.transfers}</td>
                <td className={gw.transfersCost > 0 ? styles.negative : ''}>
                  {gw.transfersCost > 0 ? `-${gw.transfersCost}` : '0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
