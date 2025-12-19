import { Suspense } from 'react';
import { getBootstrapStatic, getLeagueManagers } from '../../../../Fpl/Data/Client/FPLApiClient';
import type { BootstrapStatic, LeagueStandings } from '../../../../Fpl/Types';
import styles from './Dashboard.module.css';

type Props = {
  leagueId: number;
};

export const DashboardHeader = (props: Props) => {
  return (
    <Suspense fallback={<DashboardHeaderSkeleton />}>
      <DashboardHeaderInner {...props} />
    </Suspense>
  );
};

const DashboardHeaderSkeleton = () => (
  <header className={styles.header}>
    <div className={styles.leagueInfo}>
      <h1 className={styles.leagueName}>Loading...</h1>
      <div className={styles.gwBadge}>Gameweek --</div>
    </div>
    <div className={styles.liveIndicator}>
      <span className={styles.liveDot} />
      Live
    </div>
  </header>
);

const DashboardHeaderInner = async ({ leagueId }: Props) => {
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
