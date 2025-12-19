import type { LiveScore } from '../../../../Fpl/Services/FPLEngine';
import styles from './Dashboard.module.css';

type Props = {
  scores: LiveScore[];
  leagueId: number;
};

export const LeagueSummaryServer = ({ scores }: Props) => {
  if (scores.length === 0) return null;

  // Calculate league stats
  const totalGwPoints = scores.reduce((sum, s) => sum + s.liveGWPoints, 0);
  const avgGwPoints = Math.round(totalGwPoints / scores.length);
  
  const topScorer = [...scores].sort((a, b) => b.liveGWPoints - a.liveGWPoints)[0];
  const bestCaptain = [...scores].filter(s => s.captain).sort((a, b) => (b.captain?.points || 0) - (a.captain?.points || 0))[0];

  return (
    <div className={styles.leagueSummary}>
      <div className={styles.summaryHeader}>
        <span className="material-symbols-sharp">analytics</span>
        <h3>League Overview</h3>
      </div>
      
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{avgGwPoints}</div>
          <div className={styles.summaryLabel}>Average GW Points</div>
        </div>
        
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{topScorer.liveGWPoints}</div>
          <div className={styles.summaryLabel}>
            Top Score: <strong>{topScorer.managerName}</strong>
          </div>
        </div>

        {bestCaptain && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryValue}>{bestCaptain.captain?.points}</div>
            <div className={styles.summaryLabel}>
              Best Captain: <strong>{bestCaptain.captain?.name}</strong>
            </div>
          </div>
        )}
      </div>

      <div className={styles.spotlightContainer}>
        <div className={styles.spotlightHeader}>
          <span className="material-symbols-sharp">explore</span>
          <h4>Quick Guide</h4>
        </div>
        <div className={styles.spotlightContent}>
          <p>← Click a manager in the standings to view their full squad and analytics.</p>
          <p>Use the sidebar to explore league-wide trends, FDR, and transfer recommendations.</p>
        </div>
      </div>
    </div>
  );
};
