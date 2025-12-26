import { Suspense } from 'react';
import { getBootstrapStatic, getLeagueManagers } from '../../../../Fpl/Data/Client/FPLApiClient';
import type { BootstrapStatic, LeagueStandings } from '../../../../Fpl/Types';
import styles from './Dashboard.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * DashboardHeader with self-contained Suspense boundary.
 * Accepts PageProps directly and handles param extraction + data fetching internally.
 */
export const DashboardHeader = (props: PageProps) => {
  return (
    <Suspense fallback={<DashboardHeaderSkeleton />}>
      <DashboardHeaderInner {...props} />
    </Suspense>
  );
};

const DashboardHeaderSkeleton = () => (
  <header className={styles.header}>
    <div className={styles.leagueInfo}>
      <div style={{ 
        height: '20px', 
        width: '180px', 
        background: 'var(--ink-light)', 
        borderRadius: '4px' 
      }} />
      <div className={styles.gwBadge} style={{ opacity: 0.5 }}>Gameweek --</div>
    </div>
    <div className={styles.liveIndicator}>
      <span className={styles.liveDot} />
      Live
    </div>
  </header>
);

const DashboardHeaderInner = async ({ params }: PageProps) => {
  const { id } = await params;
  const leagueId = parseInt(id, 10);

  const [bootstrap, leagueData] = await Promise.all([
    getBootstrapStatic() as Promise<BootstrapStatic>,
    getLeagueManagers(leagueId) as Promise<LeagueStandings>,
  ]);

  const currentEvent = bootstrap.events.find(e => e.is_current);
  const currentGw = currentEvent?.id || 38;

  return (
    <header className={styles.header}>
      <div className={styles.leagueInfo}>
        <h1 className={styles.leagueName}>{leagueData.league.name}</h1>
        <div className={styles.gwBadge}>Gameweek {currentGw}</div>
      </div>
      <div className={styles.liveIndicator}>
        <span className={styles.liveDot} />
        Live
      </div>
    </header>
  );
};
