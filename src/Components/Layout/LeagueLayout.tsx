import Link from 'next/link';
import { LiveTicker } from './LiveTicker';
import { GlobalNav } from './GlobalNav';
import styles from './LeagueLayout.module.css';

type LeagueLayoutProps = {
  children: React.ReactNode;
  leagueId: string;
};

export const LeagueLayout = ({ children, leagueId }: LeagueLayoutProps) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <Link href="/" className={styles.brand}>
            FPL<span>Alchemy</span>
          </Link>
          
          <div className={styles.liveIndicator}>
            <div className={styles.liveDot} />
            LIVE
          </div>
        </div>
        
        <div className={styles.tickerContainer}>
           <LiveTicker />
        </div>
        
        <GlobalNav leagueId={leagueId} />
      </header>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};
