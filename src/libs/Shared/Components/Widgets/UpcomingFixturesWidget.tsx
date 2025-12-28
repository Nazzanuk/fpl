import { Suspense } from 'react';
import { getAllFixtures } from '../../../Fpl/Data/Client/FPLApiClient';
import { getBootstrapEvents, getBootstrapTeams } from '../../../Fpl/Data/Client/BootstrapClient';
import { StatCard } from './StatCard';
import styles from './UpcomingFixturesWidget.module.css';

export const UpcomingFixturesWidget = () => {
  return (
    <Suspense fallback={<UpcomingFixturesWidgetSkeleton />}>
      <UpcomingFixturesWidgetInner />
    </Suspense>
  );
};

const UpcomingFixturesWidgetSkeleton = () => {
  return (
    <StatCard title="Upcoming">
      <div className={styles.list}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonItem} />
        ))}
      </div>
    </StatCard>
  );
};

const UpcomingFixturesWidgetInner = async () => {
  const [events, teams] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapTeams(),
  ]);
  const nextEvent = events.find((e: any) => e.is_next);

  if (!nextEvent) {
    return <StatCard title="Upcoming"><div className={styles.empty}>Season Finished</div></StatCard>;
  }

  const allFixtures = await getAllFixtures();
  const fixtures = allFixtures.filter((f: any) => f.event === nextEvent.id);
  const getTeamName = (id: number) => teams.find((t: any) => t.id === id)?.short_name || 'UNK';

  // Show first 5
  const upcoming = fixtures.slice(0, 5);

  return (
    <StatCard title={`Next: Gameweek ${nextEvent.id}`}>
      <div className={styles.list}>
        {upcoming.map((fixture: any) => (
          <div key={fixture.id} className={styles.item}>
            <div className={styles.matchup}>
              {getTeamName(fixture.team_h)} vs {getTeamName(fixture.team_a)}
            </div>
            <div className={styles.date}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(fixture.kickoff_time).getUTCDay()]} {new Date(fixture.kickoff_time).getUTCHours().toString().padStart(2, '0')}:{new Date(fixture.kickoff_time).getUTCMinutes().toString().padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>
    </StatCard>
  );
};
