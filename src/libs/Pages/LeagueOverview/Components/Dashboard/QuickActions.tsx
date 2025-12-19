'use client';

import styles from './QuickActions.module.css';

type Props = {
  currentView: 'standings' | 'h2h' | 'differentials' | 'ownership';
  onViewChange: (view: 'standings' | 'h2h' | 'differentials' | 'ownership') => void;
};

export const QuickActions = ({ currentView, onViewChange }: Props) => {
  const actions = [
    { id: 'standings', label: 'Standings', icon: '1' },
    { id: 'h2h', label: 'Head to Head', icon: 'vs' },
    { id: 'differentials', label: 'Differentials', icon: 'd' },
    { id: 'ownership', label: 'Ownership', icon: '%' },
  ] as const;

  return (
    <div className={styles.container}>
      {actions.map(action => (
        <button
          key={action.id}
          className={`${styles.action} ${currentView === action.id ? styles.active : ''}`}
          onClick={() => onViewChange(action.id)}
        >
          <span className={styles.icon}>{action.icon}</span>
          <span className={styles.label}>{action.label}</span>
        </button>
      ))}
    </div>
  );
};
