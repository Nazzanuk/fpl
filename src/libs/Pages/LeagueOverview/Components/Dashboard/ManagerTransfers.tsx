import { EntityLink } from '../../../../Shared/Components/EntityLink/EntityLink';
import styles from './ManagerTransfers.module.css';

type Transfer = {
  playerIn: { id: number; name: string; teamCode?: number };
  playerOut: { id: number; name: string; teamCode?: number };
  gameweek: number;
};

type Props = {
  transfers: Transfer[];
};

export const ManagerTransfers = ({ transfers }: Props) => {
  if (transfers.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Transfers</h3>
      </div>
      <div className={styles.list}>
        {transfers.map((t, i) => (
          <div key={i} className={styles.transfer}>
            <div className={styles.playerWrapper}>
                <EntityLink 
                    type="player" 
                    id={t.playerIn.id} 
                    label={t.playerIn.name} 
                    variant="inline"
                    className={styles.transferIn}
                />
            </div>
            <span className={styles.arrow}>for</span>
            <div className={styles.playerWrapper}>
                <EntityLink 
                    type="player" 
                    id={t.playerOut.id} 
                    label={t.playerOut.name} 
                    variant="inline"
                    className={styles.transferOut}
                />
            </div>
            <span className={styles.gw}>GW{t.gameweek}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
