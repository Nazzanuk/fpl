import type { PlayerDetail } from '../../../../Fpl/Types';
import styles from './PlayerFixtures.module.css';

type Props = {
  fixtures: PlayerDetail['fixtures'];
};

export const PlayerFixtures = ({ fixtures }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Upcoming Fixtures</h3>
      </div>
      {fixtures.length === 0 ? (
        <div className={styles.empty}>No upcoming fixtures</div>
      ) : (
        <div className={styles.fixtureList}>
          {fixtures.map(fixture => (
            <div key={fixture.eventId} className={styles.fixture}>
              <span className={styles.gameweek}>{fixture.eventName}</span>
              <div className={styles.opponent}>
                <span className={styles.opponentName}>{fixture.opponentShort}</span>
                <span className={styles.venue} data-home={fixture.isHome}>
                  {fixture.isHome ? 'H' : 'A'}
                </span>
              </div>
              <div className={styles.difficulty} data-fdr={fixture.difficulty}>
                {fixture.difficulty}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
