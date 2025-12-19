'use client';

import { useRouter } from 'next/navigation';
import styles from './QuickActions.module.css';

type ViewType = 'standings' | 'h2h' | 'differentials' | 'ownership' | 'history' | 'trends' | 'fdr' | 'transfers' | 'chips' | 'top' | 'fixtures' | 'players' | 'best-xi';

type Props = {
  leagueId: number;
  currentView: string;
  selectedManagerId?: number;
};

export const QuickActionsClient = ({ leagueId, currentView, selectedManagerId }: Props) => {
  const router = useRouter();

  const handleViewChange = (view: ViewType) => {
    const params = new URLSearchParams();
    params.set('view', view);
    if (selectedManagerId) {
      params.set('manager', String(selectedManagerId));
    }
    router.push(`/league/${leagueId}?${params.toString()}`);
  };

  const analyticsActions = [
    { id: 'standings', label: 'Standings', icon: '🏆' },
    { id: 'h2h', label: 'H2H', icon: '🆚' },
    { id: 'differentials', label: 'Diffs', icon: '💎' },
    { id: 'ownership', label: 'Owned', icon: '📊' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'fdr', label: 'FDR', icon: '📅' },
    { id: 'transfers', label: 'Transfer', icon: '⇄' },
    { id: 'chips', label: 'Chips', icon: '🎫' },
    { id: 'top', label: 'Top 50', icon: '🌍' },
    { id: 'fixtures', label: 'Fixtures', icon: '🗓️' },
    { id: 'players', label: 'Players', icon: '🏃' },
    { id: 'best-xi', label: 'Dream Team', icon: '⭐' },
  ] as const;

  const mainActions = analyticsActions.slice(0, 4);
  const secondaryActions = analyticsActions.slice(4);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {mainActions.map(action => (
          <button
            key={action.id}
            type="button"
            className={`${styles.action} ${currentView === action.id ? styles.active : ''}`}
            onClick={() => handleViewChange(action.id)}
          >
            <span className={styles.emoji}>{action.icon}</span>
            <span className={styles.label}>{action.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.container} data-secondary="true">
        {secondaryActions.map(action => (
          <button
            key={action.id}
            type="button"
            className={`${styles.action} ${currentView === action.id ? styles.active : ''}`}
            onClick={() => handleViewChange(action.id)}
          >
            <span className={styles.emoji}>{action.icon}</span>
            <span className={styles.label}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
