'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './GlobalNav.module.css';

type GlobalNavProps = {
  leagueId: string;
};

const NAV_ITEMS = [
  { label: 'Standings', path: 'standings', default: true },
  { label: 'Head to Head', path: 'h2h' },
  { label: 'Differentials', path: 'differentials' },
  { label: 'Ownership', path: 'ownership' },
  { label: 'Trends', path: 'trends' },
];

export const GlobalNav = ({ leagueId }: GlobalNavProps) => {
  const pathname = usePathname();
  
  return (
    <nav className={styles.navContext}>
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          // Construct URL
          // If default (standings), we match on either empty suffix or /standings
          // But since we are restructuring, let's assume we redirect /league/[id] to /league/[id]/standings
          // or we handle both.
          
          const targetUrl = `/league/${leagueId}/${item.path}`;
          // Also handle the root case for standings logic if needed, but let's stick to explicit paths for now
          // logic: is active if pathname starts with targetUrl OR if it's default and we are at root league ID
          
          const isAtRoot = pathname === `/league/${leagueId}`;
          const isAtTarget = pathname.startsWith(targetUrl);
          const isActive = (item.default && isAtRoot) || isAtTarget;
          
          // If default item and at root, we might want to link to plain ID or explicit standings. 
          // Let's link to explicit sub-paths to be clean.
          
          return (
            <li key={item.path} className={styles.navItem}>
              <Link 
                href={targetUrl} 
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
