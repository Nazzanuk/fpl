import { EntityLink } from '../../../../Shared/Components/EntityLink/EntityLink';
import type { PlayerDetail } from '../../../../Fpl/Types';
import styles from './PlayerLeagueOwnership.module.css';

type Props = {
  ownership: PlayerDetail['leagueOwnership'];
  onSelectManager?: (managerId: number) => void; // Deprecated
  onClose?: () => void; // Deprecated
};

export const PlayerLeagueOwnership = ({ ownership }: Props) => {
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
            <div key={owner.managerId} className={styles.owner}>
              <div className={styles.ownerInfo}>
                <EntityLink
                  type="manager"
                  id={owner.managerId}
                  label={owner.managerName}
                  className={styles.ownerName}
                />
                {owner.isCaptain && <span className={styles.captainBadge}>C</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
