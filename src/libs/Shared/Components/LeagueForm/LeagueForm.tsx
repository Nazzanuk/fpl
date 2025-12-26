'use client';

import { useState, useEffect } from 'react';
import { navigateToLeague } from '../../../Fpl/Actions/NavigationActions';
import styles from './LeagueForm.module.css';

export const LeagueForm = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('fpl_league_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse league history', e);
      }
    }
  }, []);

  const handleSubmit = (_e: React.FormEvent<HTMLFormElement>) => {
    // We want the server action to run, but we also want to save to history
    // Since it's a form action, we can't easily intercept it and keep the server action behavior
    // without using useFormState or similar, but we can just save it to localStorage
    // when the input changes or on a separate click handler if we were using traditional preventDefault.
    
    // Actually, we can just save it when the user clicks "Track" 
    if (input && /^\d+$/.test(input)) {
      const newHistory = [input, ...history.filter(id => id !== input)].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('fpl_league_history', JSON.stringify(newHistory));
    }
  };

  const handleRecentClick = (id: string) => {
    const formData = new FormData();
    formData.append('leagueId', id);
    navigateToLeague(formData);
  };

  return (
    <div className={styles.wrapper}>
      <form action={navigateToLeague} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="number"
            name="leagueId"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your league ID"
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Track
          </button>
        </div>
        <p className={styles.hint}>
          Find your league ID in the URL when viewing your league on the FPL website
        </p>
      </form>

      {history.length > 0 && (
        <div className={styles.history}>
          <span className={styles.historyLabel}>Recent:</span>
          <div className={styles.historyItems}>
            {history.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleRecentClick(id)}
                className={styles.historyItem}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
