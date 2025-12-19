import { Suspense } from 'react';
import { getDifferentials } from '../../../../Fpl/Services/FPLEngine';
import styles from './DifferentialsView.module.css';

type Props = {
  leagueId: number;
  managerId: number;
};

export const DifferentialsView = (props: Props) => {
  return (
    <Suspense fallback={<DifferentialsSkeleton />}>
      <DifferentialsInner {...props} />
    </Suspense>
  );
};

const DifferentialsSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonCard} />
    <div className={styles.skeletonCard} />
  </div>
);

const DifferentialsInner = async ({ leagueId, managerId }: Props) => {
  const { unique, missing } = await getDifferentials(leagueId, managerId);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.iconGreen}>+</span>
          Your Differentials
        </h3>
        <p className={styles.sectionDesc}>
          Players only you (or few others) own - your edge over rivals
        </p>
        {unique.length === 0 ? (
          <div className={styles.empty}>No significant differentials found</div>
        ) : (
          <div className={styles.playerList}>
            {unique.map(player => (
              <div key={player.elementId} className={styles.player}>
                <div className={styles.playerMain}>
                  <span className={styles.playerName}>{player.name}</span>
                  <span className={styles.playerTeam}>{player.teamName}</span>
                </div>
                <div className={styles.ownership}>
                  {player.owners.length} own
                  <span className={styles.percent}>{player.ownershipPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.iconRed}>!</span>
          Popular Players You&apos;re Missing
        </h3>
        <p className={styles.sectionDesc}>
          High-ownership players you don&apos;t have - potential risk
        </p>
        {missing.length === 0 ? (
          <div className={styles.empty}>You have all the popular picks</div>
        ) : (
          <div className={styles.playerList}>
            {missing.map(player => (
              <div key={player.elementId} className={`${styles.player} ${styles.missing}`}>
                <div className={styles.playerMain}>
                  <span className={styles.playerName}>{player.name}</span>
                  <span className={styles.playerTeam}>{player.teamName}</span>
                </div>
                <div className={styles.ownership}>
                  {player.owners.length} own
                  <span className={styles.percent}>{player.ownershipPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
