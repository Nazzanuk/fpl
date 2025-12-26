import type { LiveManagerScore } from '../../../Fpl/Types';
import styles from './LiveTable.module.css';
import clsx from 'clsx';
import Link from 'next/link';

type Props = {
  score: LiveManagerScore;
  rank: number;
  leagueId: number;
};

export const ManagerRow = ({ score, rank, leagueId }: Props) => {
  return (
    <tr className={styles.row}>
      <td className={clsx(styles.cell, styles.rank)}>{rank}</td>
      <td className={styles.cell}>
        <Link href={`/league/${leagueId}/manager/${score.managerId}`} className={styles.link}>
          <div className={styles.managerInfo}>
            <span className={styles.managerName}>{score.managerName}</span>
            <span className={styles.playerName}>{score.playerName}</span>
          </div>
        </Link>
      </td>
      <td className={clsx(styles.cell, styles.points, styles.pointsLive)}>
        {score.liveGWPoints}
      </td>
      <td className={clsx(styles.cell, styles.points)}>
        {score.liveTotalPoints}
      </td>
      <td className={clsx(styles.cell, styles.points, styles.trimean)} title="Secret Sauce">
        {score.teamTrimean?.toFixed(2) || '0.00'}
      </td>
    </tr>
  );
};
