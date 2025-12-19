'use client';

import type { FDRData } from '../../../../Fpl/Services/AnalyticsEngine';
import styles from './FDRPlanner.module.css';

type Props = {
  teams: FDRData[];
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

export const FDRPlannerContent = ({ teams }: Props) => {
  const gameweeks = teams[0]?.fixtures.map(f => f.event) || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Fixture Difficulty</h2>
        <span className={styles.subtitle}>Next {gameweeks.length} Gameweeks · Sorted by Avg Difficulty</span>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendTitle}>Difficulty</span>
        <div className={styles.legendItems}>
          {[1, 2, 3, 4, 5].map(d => (
            <div key={d} className={styles.legendItem} data-difficulty={d}>
              <span className={styles.legendDot} data-difficulty={d} />
              <span className={styles.legendLabel}>{DIFFICULTY_LABELS[d]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.gridWrapper}>
        <table className={styles.grid}>
          <thead>
            <tr>
              <th className={styles.teamHeader}>
                <span className={styles.headerText}>Team</span>
              </th>
              <th className={styles.avgHeader}>
                <span className={styles.headerText}>Avg</span>
              </th>
              {gameweeks.map(gw => (
                <th key={gw} className={styles.gwHeader}>
                  <span className={styles.headerText}>{gw}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr key={team.teamId} className={styles.row} data-rank={idx < 5 ? 'top' : idx >= 15 ? 'bottom' : 'mid'}>
                <td className={styles.teamCell}>
                  <span className={styles.rank}>{idx + 1}</span>
                  <span className={styles.teamName}>{team.teamShortName}</span>
                </td>
                <td className={styles.avgCell}>
                  <span className={styles.avgValue} data-difficulty={Math.round(team.avgDifficulty)}>
                    {team.avgDifficulty.toFixed(1)}
                  </span>
                </td>
                {team.fixtures.map((fixture, fIdx) => (
                  <td
                    key={`${team.teamId}-${fixture.event}-${fIdx}`}
                    className={styles.fixtureCell}
                    data-difficulty={fixture.difficulty}
                  >
                    <span className={styles.opponent}>{fixture.opponentShort}</span>
                    <span className={styles.venue} data-home={fixture.isHome}>
                      {fixture.isHome ? 'H' : 'A'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
