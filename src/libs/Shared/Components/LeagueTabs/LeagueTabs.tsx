'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './LeagueTabs.module.css';

type LeagueTabsProps = {
  leagueId: number;
};

export const LeagueTabs = ({ leagueId }: LeagueTabsProps) => {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'table';

  const tabs = [
    { id: 'table', label: 'Table' },
    { id: 'stats', label: 'Stats' },
    { id: 'fixtures', label: 'Fixtures' },
  ];

  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/league/${leagueId}?tab=${tab.id}`}
          className={`${styles.tab} ${currentTab === tab.id ? styles.active : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};
