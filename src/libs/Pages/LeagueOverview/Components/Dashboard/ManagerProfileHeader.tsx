import Link from 'next/link';
import styles from './ManagerProfileHeader.module.css';

type Props = {
  managerName: string;
  playerName: string;
  playerRegionCode: string;
  leagueId: number;
  managerId: number;
};

export const ManagerProfileHeader = ({ managerName, playerName, playerRegionCode, leagueId, managerId }: Props) => {
  return (
    <div className={styles.header}>
      <div className={styles.icon}>
        <svg viewBox="0 0 24 24" fill="currentColor" className={styles.iconSvg}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
      <div className={styles.info}>
        <h2 className={styles.managerName}>{managerName}</h2>
        <div className={styles.playerRow}>
          <span className={styles.playerName}>{playerName}</span>
          {playerRegionCode && (
            <span className={styles.flag}>{getFlagEmoji(playerRegionCode)}</span>
          )}
        </div>
      </div>
      <Link 
        href={`/league/${leagueId}/compare/${managerId}`}
        className={styles.compareBtn}
      >
        <span className="material-symbols-sharp">compare_arrows</span>
        Compare
      </Link>
    </div>
  );
};

const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
