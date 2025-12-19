import styles from './ManagerTransfers.module.css';

type Transfer = {
  playerIn: { id: number; name: string };
  playerOut: { id: number; name: string };
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
            <span className={styles.transferIn}>{t.playerIn.name}</span>
            <span className={styles.arrow}>for</span>
            <span className={styles.transferOut}>{t.playerOut.name}</span>
            <span className={styles.gw}>GW{t.gameweek}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
