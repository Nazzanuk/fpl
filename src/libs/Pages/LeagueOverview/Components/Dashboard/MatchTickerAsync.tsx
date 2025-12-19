import { Suspense } from 'react';
import { getBootstrapStatic, getFixtures } from '../../../../Fpl/Data/Client/FPLApiClient';
import { MatchTicker } from './MatchTicker';
import styles from './MatchTicker.module.css';

export const MatchTickerAsync = () => {
  return (
    <Suspense fallback={<MatchTickerSkeleton />}>
      <MatchTickerInner />
    </Suspense>
  );
};

const MatchTickerSkeleton = () => (
  <div className={styles.ticker}>
    <div className={styles.track}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={styles.match} style={{ opacity: 0.5 }}>
          <span className={styles.team}>---</span>
          <div className={styles.center}>
            <span className={styles.score}>- - -</span>
            <span className={styles.status}>--:--</span>
          </div>
          <span className={styles.team}>---</span>
        </div>
      ))}
    </div>
  </div>
);

const MatchTickerInner = async () => {
  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);
  const currentGw = currentEvent?.id || 38;

  const fixtures = await getFixtures(currentGw);

  const formattedFixtures = fixtures.map((f: any) => {
    const homeTeam = bootstrap.teams.find((t: any) => t.id === f.team_h)?.short_name || 'UNK';
    const awayTeam = bootstrap.teams.find((t: any) => t.id === f.team_a)?.short_name || 'UNK';

    let status: 'live' | 'finished' | 'upcoming' = 'upcoming';
    if (f.finished) status = 'finished';
    else if (f.started || f.team_h_score !== null) status = 'live';

    return {
      id: f.id,
      homeTeam,
      awayTeam,
      homeScore: f.team_h_score,
      awayScore: f.team_a_score,
      status,
      minutes: f.minutes || 0,
      kickoff: f.kickoff_time,
    };
  });

  return <MatchTicker fixtures={formattedFixtures} />;
};
