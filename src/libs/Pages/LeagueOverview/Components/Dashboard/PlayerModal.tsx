'use client';

import styles from './PlayerModal.module.css';

type Owner = {
  managerId: number;
  managerName: string;
  isCaptain: boolean;
};

type PlayerInfo = {
  elementId: number;
  name: string;
  teamName: string;
  points: number;
  form: string;
  selectedBy: string;
  owners: Owner[];
  ownershipPercent: number;
};

type Props = {
  player: PlayerInfo | null;
  onClose: () => void;
  onSelectManager: (id: number) => void;
};

export const PlayerModal = ({ player, onClose, onSelectManager }: Props) => {
  if (!player) return null;

  const handleSelectManager = (id: number) => {
    onSelectManager(id);
    onClose();
  };

  return (
    <div className={`${styles.overlay} ${styles.visible}`} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>x</button>

        <div className={styles.header}>
          <h2 className={styles.playerName}>{player.name}</h2>
          <span className={styles.teamBadge}>{player.teamName}</span>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{player.points}</div>
            <div className={styles.statLabel}>GW Points</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{player.form}</div>
            <div className={styles.statLabel}>Form</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{player.selectedBy}%</div>
            <div className={styles.statLabel}>Selected</div>
          </div>
        </div>

        <div className={styles.ownership}>
          <div className={styles.ownershipHeader}>
            <h3 className={styles.sectionTitle}>Owned by {player.owners.length} in your league</h3>
            <span className={styles.percent}>{player.ownershipPercent}%</span>
          </div>

          <div className={styles.ownerList}>
            {player.owners.map(owner => (
              <button
                key={owner.managerId}
                className={styles.owner}
                onClick={() => handleSelectManager(owner.managerId)}
              >
                <span className={styles.ownerName}>{owner.managerName}</span>
                {owner.isCaptain && <span className={styles.captainBadge}>C</span>}
                <span className={styles.viewBtn}>View Team</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
