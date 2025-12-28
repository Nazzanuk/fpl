import { Suspense } from 'react';
import { getManagerDetailSimple } from '../../../../Fpl/Services/FPLEngine';
import { ManagerProfileHeader } from './ManagerProfileHeader';
import { ManagerStats } from './ManagerStats';
import { GameweekStats } from './GameweekStats';
import { MiniPitch } from './MiniPitch';
import { ManagerHistory } from './ManagerHistory';
import { ManagerTransfers } from './ManagerTransfers';
import styles from './ManagerPanel.module.css';

type Props = {
  leagueId: number;
  managerId: number;
  rank?: number;
  currentGw?: number;
};

export const ManagerPanel = (props: Props) => {
  return (
    <Suspense fallback={<ManagerPanelSkeleton />}>
      <ManagerPanelInner {...props} />
    </Suspense>
  );
};

const ManagerPanelSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonHeader} />
    <div className={styles.skeletonStats} />
    <div className={styles.skeletonPitch} />
  </div>
);

const ManagerPanelInner = async ({ leagueId, managerId }: Props) => {
  const detail = await getManagerDetailSimple(leagueId, managerId);

  if (!detail) {
    return <div className={styles.error}>Failed to load manager data</div>;
  }

  return (
    <div className={styles.container}>
      <ManagerProfileHeader
        managerName={detail.managerName}
        playerName={detail.playerName}
        playerRegionCode={detail.playerRegionCode}
        leagueId={leagueId}
        managerId={managerId}
      />
      <div className={styles.columns}>
        <div className={styles.leftColumn}>
          <ManagerStats
            overallPoints={detail.liveTotalPoints}
            overallRank={detail.overallRank}
            totalPlayers={detail.totalPlayers}
            gwPoints={detail.liveGWPoints}
          />
        </div>
        <div className={styles.rightColumn}>
          <GameweekStats
            currentGw={detail.currentGw}
            avgPoints={detail.avgPoints}
            highestPoints={detail.highestPoints}
            totalPoints={detail.liveGWPoints}
            gwRank={detail.gwRank}
            gwTransfers={detail.gwTransfers}
          />
        </div>
      </div>
      <div className={styles.pitch}>
        <MiniPitch picks={detail.picks} leagueId={leagueId} />
      </div>
      {detail.transferCost > 0 && (
        <div className={styles.transferCost}>{detail.transferCost} pts transfer cost</div>
      )}
      <ManagerHistory history={detail.history} />
      <ManagerTransfers transfers={detail.recentTransfers} />
    </div>
  );
};
