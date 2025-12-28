import { Suspense } from 'react';
import { getLeagueStats } from '../../../../Fpl/Services/StatsService';
import { getBootstrapEvents, getBootstrapElements, getBootstrapTeams } from '../../../../Fpl/Data/Client/BootstrapClient';
import styles from './LeagueStats.module.css';

type LeagueStatsProps = {
  leagueId: number;
};

export const LeagueStats = ({ leagueId }: LeagueStatsProps) => {
  return (
    <Suspense fallback={<LeagueStatsSkeleton />}>
      <LeagueStatsInner leagueId={leagueId} />
    </Suspense>
  );
};

const LeagueStatsSkeleton = () => {
  return <div className={styles.skeleton}>Loading stats...</div>;
};

const LeagueStatsInner = async ({ leagueId }: LeagueStatsProps) => {
  const [events, elements, teams] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapElements(),
    getBootstrapTeams(),
  ]);
  const currentEvent = events.find((e: any) => e.is_current);
  const currentGw = currentEvent ? currentEvent.id : 38;

  const stats = await getLeagueStats(leagueId);

  // Helper to get player name
  const getPlayerName = (id: number) => {
    const player = elements.find((e: any) => e.id === id);
    return player ? player.web_name : `Player ${id}`;
  };

  // Helper to get player team
  const getPlayerTeam = (id: number) => {
    const player = elements.find((e: any) => e.id === id);
    if (!player) return '';
    const team = teams.find((t: any) => t.id === player.team);
    return team ? team.short_name : '';
  };

  // Helper to get player image url (simplified)
  const getPlayerImage = (id: number) => {
     const player = elements.find((e: any) => e.id === id);
     // FPL uses a specific ID format for images, usually code.png or id.png
     // For now, we'll use a placeholder or just the name.
     // The provided images show player faces, which come from `https://resources.premierleague.com/premierleague/photos/players/110x140/p{code}.png`
     // We need the `code` from bootstrap elements.
     return player ? `https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png` : '';
  };


  const renderStatSection = (title: string, data: typeof stats.mostCaptained, label: string) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.grid}>
        {data.map((item, index) => (
          <div key={item.element} className={styles.card}>
            <div className={styles.rank}>{index + 1}</div>
            <img 
                src={getPlayerImage(item.element)} 
                alt={getPlayerName(item.element)} 
                className={styles.playerImage}
            />
            <div className={styles.playerInfo}>
              <div className={styles.name}>{getPlayerName(item.element)}</div>
              <div className={styles.team}>{getPlayerTeam(item.element)}</div>
            </div>
            <div className={styles.statValue}>
              <span className={styles.count}>{item.count}</span>
              <span className={styles.label}>{label}</span>
            </div>
             <div className={styles.percentage}>
                {Math.round((item.count / item.totalManagers) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {renderStatSection('Most Captained', stats.mostCaptained, 'Captained')}
      {renderStatSection('Most Transferred In', stats.mostTransferredIn, 'Bought')}
      {renderStatSection('Most Transferred Out', stats.mostTransferredOut, 'Sold')}
    </div>
  );
};
