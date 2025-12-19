import styles from './PitchView.module.css';
import clsx from 'clsx';

type Props = {
  name: string;
  points: number;
  teamCode: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
};

export const PlayerCard = ({ name, points, teamCode, isCaptain, isViceCaptain, multiplier }: Props) => {
  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}-66.png`;
  
  // Calculate effective points if captain
  const displayPoints = points * multiplier;

  return (
    <div className={styles.card}>
      <div className={styles.shirtContainer}>
        <img src={shirtUrl} alt={name} className={styles.shirt} />
        {isCaptain && <div className={styles.captainBadge}>C</div>}
        {isViceCaptain && <div className={styles.captainBadge}>V</div>}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={clsx(styles.points, { [styles.pointsLive]: true })}>
          {displayPoints}
        </div>
      </div>
    </div>
  );
};
