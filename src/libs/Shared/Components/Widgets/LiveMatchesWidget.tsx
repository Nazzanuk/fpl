import { Suspense } from 'react';
import { getBootstrapStatic, getAllFixtures } from '../../../Fpl/Data/Client/FPLApiClient';
import { StatCard } from './StatCard';
import styles from './LiveMatchesWidget.module.css';

export const LiveMatchesWidget = () => {
  return (
    <Suspense fallback={<LiveMatchesWidgetSkeleton />}>
      <LiveMatchesWidgetInner />
    </Suspense>
  );
};

const LiveMatchesWidgetSkeleton = () => {
  return (
    <StatCard title="Live Matches">
      <div className={styles.matchList}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonMatch} />
        ))}
      </div>
    </StatCard>
  );
};

const LiveMatchesWidgetInner = async () => {
  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);

  if (!currentEvent) {
    return (
      <StatCard title="Live Matches">
        <div className={styles.empty}>No active gameweek</div>
      </StatCard>
    );
  }

  const allFixtures = await getAllFixtures();
  const fixtures = allFixtures.filter((f: any) => f.event === currentEvent.id);
  const teams = bootstrap.teams;

  const getTeamName = (id: number) => teams.find((t: any) => t.id === id)?.short_name || 'UNK';

  // Filter for matches that are not finished but started, or just all for the day?
  // Let's show all for the current GW, prioritizing live ones.
  const sortedFixtures = [...fixtures].sort((a, b) => {
    if (a.finished === b.finished) return 0;
    return a.finished ? 1 : -1;
  });

  return (
    <StatCard title={`Gameweek ${currentEvent.id}`}>
      <div className={styles.matchList}>
        {sortedFixtures.map((fixture) => (
          <div key={fixture.id} className={styles.match}>
            <div className={`${styles.team} ${styles.home}`}>{getTeamName(fixture.team_h)}</div>
            <div className={styles.center}>
                <div className={styles.score}>
                {fixture.team_h_score ?? '-'} : {fixture.team_a_score ?? '-'}
                </div>
                <div className={`${styles.time} ${!fixture.finished && fixture.team_h_score !== null ? styles.live : ''}`}>
                    {fixture.finished ? 'FT' : (fixture.team_h_score !== null ? 'LIVE' : new Date(fixture.kickoff_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))}
                </div>
            </div>
            <div className={`${styles.team} ${styles.away}`}>{getTeamName(fixture.team_a)}</div>
          </div>
        ))}
      </div>
    </StatCard>
  );
};
