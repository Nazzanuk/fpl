'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import styles from './DashboardSidebar.module.css';

type Props = {
  leagueId: number;
};

export const DashboardSidebar = ({ leagueId }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get('tab') || 'table';
  
  // Check if we are on the manager page
  const isManagerPage = pathname.includes('/manager/');

  return (
    <nav className={styles.nav}>
      <Link 
        href={`/league/${leagueId}?tab=table`} 
        className={`${styles.navItem} ${!isManagerPage && currentTab === 'table' ? styles.navItemActive : ''}`}
      >
        Live Standings
      </Link>
      <Link 
        href={`/league/${leagueId}?tab=stats`} 
        className={`${styles.navItem} ${!isManagerPage && currentTab === 'stats' ? styles.navItemActive : ''}`}
      >
        League Stats
      </Link>
      <Link 
        href={`/league/${leagueId}?tab=fixtures`} 
        className={`${styles.navItem} ${!isManagerPage && currentTab === 'fixtures' ? styles.navItemActive : ''}`}
      >
        Fixtures & Results
      </Link>
    </nav>
  );
};
