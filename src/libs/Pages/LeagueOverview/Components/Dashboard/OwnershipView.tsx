import { Suspense } from 'react';
import { getLeaguePlayerOwnership } from '../../../../Fpl/Services/FPLEngine';
import styles from './OwnershipView.module.css';

type Props = {
  leagueId: number;
};

export const OwnershipView = (props: Props) => {
  return (
    <Suspense fallback={<OwnershipSkeleton />}>
      <OwnershipInner {...props} />
    </Suspense>
  );
};

const OwnershipSkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.skeletonHeader} />
    <div className={styles.skeletonList} />
  </div>
);

const OwnershipInner = async ({ leagueId }: Props) => {
  const ownership = await getLeaguePlayerOwnership(leagueId);

  // Group by ownership percentage ranges
  const essential = ownership.filter(p => p.ownershipPercent >= 75);
  const popular = ownership.filter(p => p.ownershipPercent >= 50 && p.ownershipPercent < 75);
  const moderate = ownership.filter(p => p.ownershipPercent >= 25 && p.ownershipPercent < 50);
  const differential = ownership.filter(p => p.ownershipPercent < 25);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>League Ownership Matrix</h2>
        <p className={styles.subtitle}>
          {ownership.length} unique players across all teams
        </p>
      </div>

      <div className={styles.groups}>
        <OwnershipGroup
          title="Essential"
          desc="75%+ ownership"
          players={essential}
          colorClass={styles.essential}
        />
        <OwnershipGroup
          title="Popular"
          desc="50-74% ownership"
          players={popular}
          colorClass={styles.popular}
        />
        <OwnershipGroup
          title="Moderate"
          desc="25-49% ownership"
          players={moderate}
          colorClass={styles.moderate}
        />
        <OwnershipGroup
          title="Differential"
          desc="Under 25% ownership"
          players={differential.slice(0, 15)}
          colorClass={styles.differential}
        />
      </div>
    </div>
  );
};

type GroupProps = {
  title: string;
  desc: string;
  players: Array<{
    elementId: number;
    name: string;
    teamName: string;
    ownershipPercent: number;
    owners: Array<{ managerId: number; managerName: string; isCaptain: boolean }>;
  }>;
  colorClass: string;
};

const OwnershipGroup = ({ title, desc, players, colorClass }: GroupProps) => {
  if (players.length === 0) return null;

  return (
    <div className={`${styles.group} ${colorClass}`}>
      <div className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{title}</h3>
        <span className={styles.groupDesc}>{desc}</span>
        <span className={styles.groupCount}>{players.length}</span>
      </div>
      <div className={styles.playerGrid}>
        {players.map(player => {
          const captainCount = player.owners.filter(o => o.isCaptain).length;
          return (
            <div key={player.elementId} className={styles.playerCard}>
              <div className={styles.playerInfo}>
                <span className={styles.playerName}>{player.name}</span>
                <span className={styles.playerTeam}>{player.teamName}</span>
              </div>
              <div className={styles.playerStats}>
                <span className={styles.ownershipBar}>
                  <span
                    className={styles.ownershipFill}
                    style={{ width: `${player.ownershipPercent}%` }}
                  />
                </span>
                <span className={styles.ownershipNum}>{Math.round(player.ownershipPercent)}%</span>
              </div>
              {captainCount > 0 && (
                <div className={styles.captainInfo}>
                  {captainCount} captain{captainCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
