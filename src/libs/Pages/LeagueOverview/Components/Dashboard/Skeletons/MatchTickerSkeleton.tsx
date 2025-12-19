import styles from '../MatchTicker.module.css';

export const MatchTickerSkeleton = () => {
  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`ticker-skeleton-${i}`} className={styles.match} style={{ height: '54px', minWidth: '120px', opacity: 0.5 }}>
             {/* Simple placeholder structure */}
             <div className={`${styles.team} ${styles.home}`} style={{ width: '40px', background: 'rgba(255,255,255,0.05)' }}>&nbsp;</div>
             <div className={styles.center} style={{ width: '40px', background: 'rgba(255,255,255,0.1)' }}>&nbsp;</div>
             <div className={`${styles.team} ${styles.away}`} style={{ width: '40px', background: 'rgba(255,255,255,0.05)' }}>&nbsp;</div>
          </div>
        ))}
      </div>
    </div>
  );
};
