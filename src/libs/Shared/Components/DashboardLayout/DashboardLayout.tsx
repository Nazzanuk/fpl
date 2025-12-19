import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './DashboardLayout.module.css';

type DashboardLayoutProps = {
  children: ReactNode;
  sidePanel?: ReactNode;
  header?: ReactNode;
  leagueId: number;
};

export const DashboardLayout = ({ children, sidePanel, header, leagueId }: DashboardLayoutProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.brand}>FPL<span style={{ fontWeight: 300 }}>LIVE</span></div>
          <nav className={styles.nav}>
            <Link href={`/league/${leagueId}`} className={styles.navLink}>Dashboard</Link>
            <Link href={`/league/${leagueId}/players`} className={styles.navLink}>Players</Link>
            {/* Add more links here if needed */}
          </nav>
        </div>
        {header}
      </div>
      <div className={styles.mainContent}>
        {children}
      </div>
      {sidePanel && (
        <div className={styles.sidePanel}>
          {sidePanel}
        </div>
      )}
    </div>
  );
};
