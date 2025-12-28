import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getDifferentials } from '../../Fpl/Services/FPLEngine';
import { EntityLink } from '../../Shared/Components/EntityLink/EntityLink';
import styles from './DifferentialsPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const DifferentialsPage = (props: Props) => {
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

const DifferentialsInner = async ({ params }: Props) => {
  const [resolvedParams, cookieStore] = await Promise.all([
    params,
    cookies(),
  ]);

  const leagueId = parseInt(resolvedParams.id, 10);
  const managerId = cookieStore.get('currentlySelectedManagerId')?.value ||
                    cookieStore.get('fpl_manager_id')?.value;

  if (!managerId) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Please select a manager to view differentials
        </div>
      </div>
    );
  }

  const { unique, missing } = await getDifferentials(leagueId, parseInt(managerId, 10));

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
                <EntityLink
                  type="player"
                  id={player.elementId}
                  label=""
                  className={styles.playerLink}
                >
                  <div className={styles.playerMain}>
                    <span className={styles.playerName}>{player.name}</span>
                    <span className={styles.playerTeam}>{player.teamName}</span>
                  </div>
                </EntityLink>
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
                <EntityLink
                  type="player"
                  id={player.elementId}
                  label=""
                  className={styles.playerLink}
                >
                  <div className={styles.playerMain}>
                    <span className={styles.playerName}>{player.name}</span>
                    <span className={styles.playerTeam}>{player.teamName}</span>
                  </div>
                </EntityLink>
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
