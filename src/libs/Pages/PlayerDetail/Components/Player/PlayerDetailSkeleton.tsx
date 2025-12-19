import styles from './PlayerDetailScreen.module.css';

export const PlayerDetailSkeleton = () => (
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
