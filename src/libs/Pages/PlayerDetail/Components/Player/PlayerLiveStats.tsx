import type { PlayerDetail } from '../../../../Fpl/Types';
import styles from './PlayerLiveStats.module.css';

type Props = {
  player: PlayerDetail;
};

export const PlayerLiveStats = ({ player }: Props) => {
  const stats = [
    { label: 'GW Points', value: player.currentGwPoints },
    { label: 'Total Pts', value: player.totalPoints },
    { label: 'Form', value: player.form },
    { label: 'Selected', value: `${player.selectedByPercent}%` },
    { label: 'ICT Index', value: player.ictIndex },
  ];

  return (
    <div className={styles.liveBar}>
      {stats.map(stat => (
        <div key={stat.label} className={styles.liveStat}>
          <span className={styles.liveStatValue}>{stat.value}</span>
          <span className={styles.liveStatLabel}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
