import Image from 'next/image';
import { EntityLink } from '../../../../Shared/Components/EntityLink/EntityLink';
import type { PlayerDetail } from '../../../../Fpl/Types';
import styles from './PlayerHeader.module.css';

type Props = {
  player: PlayerDetail;
  onClose: () => void;
};

export const PlayerHeader = ({ player, onClose }: Props) => {
  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.teamCode}-110.png`;
  const statusLabels: Record<string, string> = {
    a: 'Available',
    d: 'Doubtful',
    i: 'Injured',
    s: 'Suspended',
    u: 'Unavailable',
  };

  return (
    <header className={styles.header}>
      <div className={styles.playerInfo}>
        <div className={styles.shirtWrapper}>
          <Image 
            src={shirtUrl} 
            alt={player.teamName} 
            width={64} 
            height={64} 
            className={styles.shirt}
            unoptimized 
          />
        </div>
        <div className={styles.nameBlock}>
          <div className={styles.position}>{player.positionShort}</div>
          <h1 className={styles.name}>{player.webName}</h1>
          <div className={styles.teamRow}>
            <EntityLink 
              type="team" 
              id={player.team.id} 
              label={player.teamName} 
              variant="badge"
              teamCode={player.teamCode}
            />
            {player.status !== 'available' && (
              <span className={styles.statusBadge} data-status={player.status}>
                {statusLabels[player.status] || 'Unknown'}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.priceBlock}>
        <span className={styles.priceValue}>£{player.price.toFixed(1)}</span>
        <span className={styles.priceLabel}>Price</span>
      </div>
      <button 
        type="button"
        className={styles.closeBtn} 
        onClick={onClose}
      >
        ×
      </button>
    </header>
  );
};
