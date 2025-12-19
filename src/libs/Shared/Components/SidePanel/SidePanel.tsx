import { Suspense } from 'react';
import { getAllFixtures, getBootstrapStatic } from '../../../Fpl/Data/Client/FPLApiClient';
import type { Fixture } from '../../../Fpl/Types';
import styles from './SidePanel.module.css';

export const SidePanel = () => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Live Matches</h3>
      <Suspense fallback={<div className={styles.skeleton}>Loading...</div>}>
        <LiveMatchesInner />
      </Suspense>
    </div>
  );
};

const LiveMatchesInner = async () => {
  const bootstrap = await getBootstrapStatic();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current);
  const currentGw = currentEvent ? currentEvent.id : 38;
  const allFixtures = await getAllFixtures();
  const fixtures = allFixtures.filter((f: any) => f.event === currentGw);

  // Filter for today/live
  // For demo, just show first 5
  const displayFixtures = fixtures.slice(0, 5);

  const getTeamCode = (id: number) => {
    const team = bootstrap.teams.find((t: any) => t.id === id);
    return team ? team.short_name : 'UNK';
  };

  return (
    <div className={styles.list}>
      {displayFixtures.map((f: Fixture) => (
        <div key={f.id} className={styles.match}>
          <div className={styles.team}>{getTeamCode(f.team_h)}</div>
          <div className={styles.score}>
            {f.finished || f.team_h_score !== null ? (
              <>
                <span>{f.team_h_score}</span>
                <span className={styles.dash}>-</span>
                <span>{f.team_a_score}</span>
              </>
            ) : (
              <span className={styles.time}>
                {new Date(f.kickoff_time).getUTCHours().toString().padStart(2, '0')}:
                {new Date(f.kickoff_time).getUTCMinutes().toString().padStart(2, '0')}
              </span>
            )}
          </div>
          <div className={styles.team}>{getTeamCode(f.team_a)}</div>
        </div>
      ))}
    </div>
  );
};
