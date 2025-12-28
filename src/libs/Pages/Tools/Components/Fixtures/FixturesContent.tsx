'use client';

import { useState } from 'react';
import type { Fixture, BootstrapStatic } from '../../../../Fpl/Types';
import { EntityLink } from '../../../../Shared/Components/EntityLink/EntityLink';
import styles from './Fixtures.module.css';

type Props = {
  fixtures: Fixture[];
  teams: BootstrapStatic['teams'];
  events: BootstrapStatic['events'];
  currentGw: number;
};

export const FixturesContent = ({ fixtures, teams, events, currentGw }: Props) => {
  const [selectedGw, setSelectedGw] = useState(currentGw);

  const getTeam = (id: number) => teams.find(t => t.id === id);

  const gwFixtures = fixtures
    .filter(f => f.event === selectedGw)
    .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime());

  // Group fixtures by date
  const fixturesByDate = gwFixtures.reduce((acc, fixture) => {
    const date = new Date(fixture.kickoff_time).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  const selectedEvent = events.find(e => e.id === selectedGw);
  const deadline = selectedEvent ? new Date(selectedEvent.deadline_time) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Fixtures</h2>
        {deadline && (
          <span className={styles.deadline}>
            Deadline: {deadline.toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
      </div>

      <div className={styles.gwSelector}>
        {events.map(event => (
          <button
            key={event.id}
            type="button"
            className={styles.gwButton}
            data-active={event.id === selectedGw}
            data-current={event.id === currentGw}
            onClick={() => setSelectedGw(event.id)}
          >
            <span className={styles.gwNumber}>GW{event.id}</span>
            {event.is_current && <span className={styles.gwStatus}>Current</span>}
            {event.is_next && <span className={styles.gwStatus}>Next</span>}
          </button>
        ))}
      </div>

      <div className={styles.fixturesList}>
        {Object.entries(fixturesByDate).map(([date, dateFixtures]) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateHeader}>{date}</div>
            {dateFixtures.map(fixture => {
              const homeTeam = getTeam(fixture.team_h);
              const awayTeam = getTeam(fixture.team_a);
              const hasStarted = fixture.started || fixture.finished;
              const kickoff = new Date(fixture.kickoff_time);

              return (
                <div key={fixture.id} className={styles.fixture} data-live={fixture.started && !fixture.finished}>
                  <div className={styles.fixtureTeams}>
                    <div className={styles.team} data-winner={hasStarted && (fixture.team_h_score ?? 0) > (fixture.team_a_score ?? 0)}>
                      <EntityLink
                        type="team"
                        id={fixture.team_h}
                        label={homeTeam?.name || ''}
                        teamCode={homeTeam?.code}
                        className={styles.teamName}
                      />
                      <EntityLink
                        type="team"
                        id={fixture.team_h}
                        label={homeTeam?.short_name || ''}
                        className={styles.teamShort}
                        variant="inline"
                      />
                    </div>

                    <EntityLink type="fixture" id={fixture.id} label="" className={styles.score}>
                      {hasStarted ? (
                        <>
                          <span className={styles.scoreNum}>{fixture.team_h_score}</span>
                          <span className={styles.scoreSep}>-</span>
                          <span className={styles.scoreNum}>{fixture.team_a_score}</span>
                          {fixture.started && !fixture.finished && (
                            <span className={styles.liveMinutes}>{fixture.minutes}&apos;</span>
                          )}
                        </>
                      ) : (
                        <span className={styles.kickoff}>
                          {kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </EntityLink>

                    <div className={styles.team} data-away data-winner={hasStarted && (fixture.team_a_score ?? 0) > (fixture.team_h_score ?? 0)}>
                      <EntityLink
                        type="team"
                        id={fixture.team_a}
                        label={awayTeam?.short_name || ''}
                        className={styles.teamShort}
                        variant="inline"
                      />
                      <EntityLink
                        type="team"
                        id={fixture.team_a}
                        label={awayTeam?.name || ''}
                        teamCode={awayTeam?.code}
                        className={styles.teamName}
                      />
                    </div>
                  </div>

                  <div className={styles.fdrIndicator}>
                    <span className={styles.fdrLabel}>FDR</span>
                    <span className={styles.fdrHome} data-fdr={fixture.team_h_difficulty}>
                      {fixture.team_h_difficulty}
                    </span>
                    <span className={styles.fdrAway} data-fdr={fixture.team_a_difficulty}>
                      {fixture.team_a_difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {gwFixtures.length === 0 && (
          <div className={styles.empty}>No fixtures scheduled for this gameweek</div>
        )}
      </div>
    </div>
  );
};
