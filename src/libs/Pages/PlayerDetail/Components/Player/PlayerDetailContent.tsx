'use client';

import { useRouter } from 'next/navigation';
import type { PlayerDetail } from '../../../../Fpl/Types';
import { PlayerHeader } from './PlayerHeader';
import { PlayerLiveStats } from './PlayerLiveStats';
import { PlayerFixtures } from './PlayerFixtures';
import { PlayerHistory } from './PlayerHistory';
import { PlayerSeasonStats } from './PlayerSeasonStats';
import { PlayerLeagueOwnership } from './PlayerLeagueOwnership';
import styles from './PlayerDetailScreen.module.css';

type Props = {
  player: PlayerDetail;
  leagueId: number;
};

export const PlayerDetailContent = ({ player, leagueId }: Props) => {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleSelectManager = (managerId: number) => {
    router.push(`/league/${leagueId}?manager=${managerId}`);
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.container} onClick={e => e.stopPropagation()}>
        <PlayerHeader player={player} onClose={handleClose} />
        <PlayerLiveStats player={player} />
        <div className={styles.content}>
          <PlayerFixtures fixtures={player.fixtures} />
          <PlayerHistory history={player.history} />
          <PlayerSeasonStats player={player} />
          <PlayerLeagueOwnership
            ownership={player.leagueOwnership}
            onSelectManager={handleSelectManager}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
};
