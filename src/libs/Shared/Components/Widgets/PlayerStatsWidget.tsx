import { Suspense } from 'react';
import { getEventLive } from '../../../Fpl/Data/Client/FPLApiClient';
import { getBootstrapEvents, getBootstrapElements, getBootstrapTeams } from '../../../Fpl/Data/Client/BootstrapClient';
import type { LiveElementStats } from '../../../Fpl/Types';
import { StatCard } from './StatCard';
import { PlayerStatsClient } from './PlayerStatsClient';
import styles from './PlayerStatsWidget.module.css';

export const PlayerStatsWidget = () => {
  return (
    <Suspense fallback={<PlayerStatsWidgetSkeleton />}>
      <PlayerStatsWidgetInner />
    </Suspense>
  );
};

const PlayerStatsWidgetSkeleton = () => {
  return (
    <StatCard title="Top Performers">
      <div className={styles.skeleton}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonItem} />
        ))}
      </div>
    </StatCard>
  );
};

const PlayerStatsWidgetInner = async () => {
  const [events, elements, teams] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapElements(),
    getBootstrapTeams(),
  ]);
  const currentEvent = events.find((e: any) => e.is_current) || events[0]; // Fallback
  const currentGw = currentEvent.id;
  const previousGw = currentGw > 1 ? currentGw - 1 : null;

  const [currentLive, previousLive] = await Promise.all([
    getEventLive(currentGw),
    previousGw ? getEventLive(previousGw) : Promise.resolve({ elements: [] }),
  ]);

  const processStats = (liveData: any) => {
    if (!liveData || !liveData.elements || liveData.elements.length === 0) return [];

    return liveData.elements
      .map((stats: any) => {
        const player = elements.find((e: any) => e.id === stats.id);
        const team = teams.find((t: any) => t.id === player?.team);
        return {
          id: stats.id,
          name: player?.web_name || 'Unknown',
          team: team?.short_name || 'UNK',
          points: stats.stats?.total_points || 0,
        };
      })
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, 5);
  };

  const currentGwStats = processStats(currentLive);
  const previousGwStats = processStats(previousLive);

  return (
    <StatCard title="Top Performers">
      <PlayerStatsClient 
        currentGwStats={currentGwStats} 
        previousGwStats={previousGwStats} 
        currentGwId={currentGw}
      />
    </StatCard>
  );
};
