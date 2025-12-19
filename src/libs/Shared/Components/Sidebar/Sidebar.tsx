'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

type ViewType = 'standings' | 'h2h' | 'differentials' | 'ownership' | 'history' | 'trends' | 'fdr' | 'transfers' | 'chips' | 'top' | 'fixtures' | 'players' | 'best-xi';

type Props = {
  leagueId: number;
  currentView: string;
  selectedManagerId?: number;
};

export const Sidebar = ({ leagueId, currentView, selectedManagerId }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleViewChange = (view: ViewType) => {
    const params = new URLSearchParams();
    params.set('view', view);
    if (selectedManagerId) {
      params.set('manager', String(selectedManagerId));
    }
    router.push(`/league/${leagueId}?${params.toString()}`);
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
        { id: 'best-xi', label: 'Dream Team', icon: 'hotel_class' },
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
