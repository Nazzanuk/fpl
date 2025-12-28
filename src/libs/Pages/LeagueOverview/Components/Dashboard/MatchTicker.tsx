import Link from 'next/link';
import styles from './MatchTicker.module.css';

type Fixture = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'finished' | 'upcoming';
  minutes: number;
  kickoff: string;
};

type Props = {
  fixtures: Fixture[];
  leagueId: number;
};

export const MatchTicker = ({ fixtures, leagueId }: Props) => {
  const sorted = [...fixtures].sort((a, b) => {
    const order = { live: 0, upcoming: 1, finished: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {sorted.map(fixture => (
          <Link
            key={fixture.id}
            href={`/league/${leagueId}/fixture/${fixture.id}`}
            className={`${styles.match} ${styles[fixture.status]}`}
          >
            <span className={`${styles.team} ${styles.home}`}>{fixture.homeTeam}</span>
            <div className={styles.center}>
              <span className={styles.score}>
                {fixture.homeScore ?? '-'} – {fixture.awayScore ?? '-'}
              </span>
              <span className={styles.status}>
                {fixture.status === 'live' && `${fixture.minutes}'`}
                {fixture.status === 'finished' && 'FT'}
                {fixture.status === 'upcoming' && formatKickoff(fixture.kickoff)}
              </span>
            </div>
            <span className={`${styles.team} ${styles.away}`}>{fixture.awayTeam}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const formatKickoff = (kickoff: string): string => {
  const date = new Date(kickoff);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
