import { Suspense } from 'react';
import { FixturesContent } from './FixturesContent';
import { getAllFixtures } from '../../../../Fpl/Data/Client/FPLApiClient';
import { getBootstrapEvents, getBootstrapTeams } from '../../../../Fpl/Data/Client/BootstrapClient';
import styles from './Fixtures.module.css';

export const FixturesAsync = () => {
  return (
    <Suspense fallback={<FixturesSkeleton />}>
      <FixturesInner />
    </Suspense>
  );
};

const FixturesSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonHeader} />
    <div className={styles.skeletonList} />
  </div>
);

const FixturesInner = async () => {
  const [bootstrapEvents, teams, allFixtures] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapTeams(),
    getAllFixtures(),
  ]);

  const currentEvent = bootstrapEvents.find((e: any) => e.is_current);
  const nextEvent = bootstrapEvents.find((e: any) => e.is_next);
  const currentGw = currentEvent?.id || nextEvent?.id || 1;

  // Get fixtures for current + next 5 gameweeks
  const endGw = Math.min(currentGw + 5, 38);
  const fixtures = allFixtures.filter(
    (f: any) => f.event !== null && f.event >= currentGw && f.event <= endGw
  );

  const events = bootstrapEvents.filter((e: any) => e.id >= currentGw && e.id <= endGw);

  return (
    <FixturesContent
      fixtures={fixtures}
      teams={teams}
      events={events}
      currentGw={currentGw}
    />
  );
};
