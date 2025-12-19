import type { PlayerDetail } from '../../../../Fpl/Types';
import styles from './PlayerLeagueOwnership.module.css';

type Props = {
  ownership: PlayerDetail['leagueOwnership'];
  onSelectManager: (managerId: number) => void;
  onClose: () => void;
};

export const PlayerLeagueOwnership = ({ ownership, onSelectManager, onClose }: Props) => {
  const handleSelectManager = (managerId: number) => {
    onSelectManager(managerId);
    onClose();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>League Ownership</h3>
        <span className={styles.ownershipPercent}>{ownership.ownershipPercent}%</span>
      </div>

      {ownership.owners.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{ownership.owners.length}</span>
            <span className={styles.summaryLabel}>Owners</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{ownership.captainCount}</span>
            <span className={styles.summaryLabel}>Captains</span>
          </div>
        </div>
      )}

      {ownership.owners.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>0</div>
          No managers in your league own this player
        </div>
      ) : (
        <div className={styles.ownerList}>
          {ownership.owners.map(owner => (
            <button
              key={owner.managerId}
              className={styles.owner}
              onClick={() => handleSelectManager(owner.managerId)}
            >
              <div className={styles.ownerInfo}>
                <span className={styles.ownerName}>{owner.managerName}</span>
                {owner.isCaptain && <span className={styles.captainBadge}>C</span>}
              </div>
              <span className={styles.viewLink}>View</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
