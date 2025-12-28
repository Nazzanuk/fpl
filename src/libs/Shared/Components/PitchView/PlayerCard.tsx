import Image from 'next/image';
import { EntityLink } from '../EntityLink/EntityLink';
import styles from './PitchView.module.css';
import clsx from 'clsx';

type Props = {
  id: number;
  leagueId: number;
  name: string;
  points: number;
  teamCode: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
};

export const PlayerCard = ({ id, leagueId, name, points, teamCode, isCaptain, isViceCaptain, multiplier }: Props) => {
  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}-66.png`;
  
  // Calculate effective points if captain
  const displayPoints = points * multiplier;

  return (
    <EntityLink
      type="player"
      id={id}
      label=""
      contextLeagueId={leagueId}
      className={styles.cardLink}
    >
      <div className={styles.card}>
        <div className={styles.shirtContainer}>
          <Image 
            src={shirtUrl} 
            alt={name} 
            width={40} 
            height={40} 
            className={styles.shirt} 
            unoptimized
          />
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
    </EntityLink>
  );
};
