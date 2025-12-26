'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

type ViewType = 'standings' | 'h2h' | 'differentials' | 'ownership' | 'history' | 'trends' | 'fdr' | 'transfers' | 'chips' | 'top' | 'fixtures' | 'players' | 'dream-team' | 'my-team';

type Props = {
  leagueId: number;
};

// Derive current view and manager from pathname
const parsePathname = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  // Expected patterns:
  // /league/[id] - default (standings)
  // /league/[id]/[view] - view-only (players, fixtures, etc.)
  // /league/[id]/manager/[managerId] - manager default
  // /league/[id]/manager/[managerId]/[view] - manager + view

  let currentView = 'standings';
  let managerId: number | undefined;

  if (parts[0] === 'league' && parts.length >= 2) {
    if (parts[2] === 'manager' && parts[3]) {
      managerId = parseInt(parts[3], 10);
      currentView = parts[4] || 'standings';
    } else if (parts[2]) {
      currentView = parts[2];
    }
  }

  return { currentView, managerId };
};

export const Sidebar = ({ leagueId }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { currentView, managerId } = parsePathname(pathname);

  const handleViewChange = (view: ViewType) => {
    // Manager-required views
    const managerRequiredViews = ['standings', 'h2h', 'transfers', 'chips', 'history', 'dream-team', 'my-team'];
    
    if (managerRequiredViews.includes(view) && managerId) {
      router.push(`/league/${leagueId}/manager/${managerId}/${view}`);
    } else if (managerRequiredViews.includes(view) && !managerId) {
      // Navigate to view-only version or stay at league level
      router.push(`/league/${leagueId}/${view}`);
    } else {
      // View-only routes (players, fixtures, top, trends, etc.)
      router.push(`/league/${leagueId}/${view}`);
    }
  };

  const sections = [
    {
      title: 'League Analytics',
      items: [
        { id: 'standings', label: 'Standings', icon: 'leaderboard' },
        { id: 'h2h', label: 'Head to Head', icon: 'compare_arrows' },
        { id: 'differentials', label: 'Differentials', icon: 'diamond' },
        { id: 'ownership', label: 'Ownership', icon: 'pie_chart' },
      ],
    },
    {
      title: 'Tools & Planning',
      items: [
        { id: 'transfers', label: 'Transfer Planner', icon: 'swap_horiz' },
        { id: 'dream-team', label: 'Dream Team', icon: 'hotel_class' },
        { id: 'my-team', label: 'My Team', icon: 'groups' },
        { id: 'fdr', label: 'FDR Planner', icon: 'calendar_month' },
        { id: 'chips', label: 'Chip Advisor', icon: 'confirmation_number' },
      ],
    },
    {
      title: 'Global Data',
      items: [
        { id: 'top', label: 'Top 50 Managers', icon: 'public' },
        { id: 'players', label: 'Player Comparison', icon: 'groups' },
        { id: 'fixtures', label: 'Fixture List', icon: 'event_note' },
        { id: 'trends', label: 'League Trends', icon: 'trending_up' },
        { id: 'history', label: 'Manager History', icon: 'history' },
      ],
    },
  ] as const;

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <span className="material-symbols-sharp" style={{ fontSize: '18px' }}>
            sports_soccer
          </span>
        </div>
        <span className={`${styles.brandText} ${isCollapsed ? styles.brandTextCollapsed : ''}`}>
          FPL<span style={{ fontWeight: 400 }}>Live</span>
        </span>
      </div>

      <nav className={styles.nav}>
        {sections.map(section => (
          <div key={section.title} className={styles.section}>
            {!isCollapsed && (
              <div className={styles.sectionHeader}>{section.title}</div>
            )}
            {isCollapsed && (
              <div className={`${styles.sectionHeader} ${styles.sectionHeaderCollapsed}`}>•</div>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${currentView === item.id ? styles.navItemActive : ''}`}
                onClick={() => handleViewChange(item.id as ViewType)}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={`${styles.icon} material-symbols-sharp`}>
                  {item.icon}
                </span>
                <span className={`${styles.label} ${isCollapsed ? styles.labelCollapsed : ''}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.collapseButton}
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="material-symbols-sharp" style={{ fontSize: '20px' }}>
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
