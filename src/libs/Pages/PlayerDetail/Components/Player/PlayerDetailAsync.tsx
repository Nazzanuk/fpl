import { Suspense } from 'react';
import { getPlayerDetail } from '../../../../Fpl/Services/PlayerEngine';
import { PlayerDetailContent } from './PlayerDetailContent';
import styles from './PlayerDetailScreen.module.css';

type Props = {
  elementId: number;
  leagueId: number;
};

export const PlayerDetailAsync = (props: Props) => {
  return (
    <Suspense fallback={<PlayerDetailAsyncSkeleton />}>
      <PlayerDetailAsyncInner {...props} />
    </Suspense>
  );
};

const PlayerDetailAsyncSkeleton = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.skeleton}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonLiveBar} />
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonSection}>
            <div className={styles.skeletonBlock} />
          </div>
          <div className={styles.skeletonSection}>
            <div className={styles.skeletonBlock} />
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerDetailAsyncInner = async ({ elementId, leagueId }: Props) => {
  const player = await getPlayerDetail(elementId, leagueId);

  if (!player) {
    return (
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.error}>Failed to load player data</div>
        </div>
      </div>
    );
  }

  return <PlayerDetailContent player={player} leagueId={leagueId} />;
};
