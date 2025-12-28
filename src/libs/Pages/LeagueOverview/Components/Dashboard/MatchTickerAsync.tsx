import { Suspense } from 'react';
import { getFixtures } from '../../../../Fpl/Data/Client/FPLApiClient';
import { getBootstrapEvents, getBootstrapTeams } from '../../../../Fpl/Data/Client/BootstrapClient';
import { MatchTicker } from './MatchTicker';
import styles from './MatchTicker.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const MatchTickerAsync = ({ params }: Props) => {
  return (
    <Suspense fallback={<MatchTickerSkeleton />}>
      <MatchTickerInner params={params} />
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

const MatchTickerInner = async ({ params }: Props) => {
  const { id } = await params;
  const leagueId = parseInt(id, 10);

  const [events, teams] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapTeams(),
  ]);

  const currentEvent = events.find((e: any) => e.is_current);
  const currentGw = currentEvent?.id || 38;

  const fixtures = await getFixtures(currentGw);

  const formattedFixtures = fixtures.map((f: any) => {
    const homeTeam = teams.find((t: any) => t.id === f.team_h)?.short_name || 'UNK';
    const awayTeam = teams.find((t: any) => t.id === f.team_a)?.short_name || 'UNK';

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

  return <MatchTicker fixtures={formattedFixtures} leagueId={leagueId} />;
};
