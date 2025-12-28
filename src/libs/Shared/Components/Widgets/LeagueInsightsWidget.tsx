import { Suspense } from 'react';
import { getBootstrapEvents, getBootstrapElements } from '../../../Fpl/Data/Client/BootstrapClient';
import { getLeagueStats } from '../../../Fpl/Services/StatsService';
import { StatCard } from './StatCard';
import styles from './LeagueInsightsWidget.module.css';

type LeagueInsightsWidgetProps = {
  leagueId: number;
};

export const LeagueInsightsWidget = (props: LeagueInsightsWidgetProps) => {
  return (
    <Suspense fallback={<LeagueInsightsWidgetSkeleton />}>
      <LeagueInsightsWidgetInner {...props} />
    </Suspense>
  );
};

const LeagueInsightsWidgetSkeleton = () => {
  return (
    <StatCard title="League Insights">
      <div className={styles.grid}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.section}>
            <div className={styles.skeletonTitle} />
            {[1, 2, 3].map(j => (
              <div key={j} className={styles.skeletonItem} />
            ))}
          </div>
        ))}
      </div>
    </StatCard>
  );
};

const LeagueInsightsWidgetInner = async ({ leagueId }: LeagueInsightsWidgetProps) => {
  const [events, elements] = await Promise.all([
    getBootstrapEvents(),
    getBootstrapElements(),
  ]);
  const currentEvent = events.find((e: any) => e.is_current) || events[0];
  const stats = await getLeagueStats(leagueId);

  const getPlayerName = (id: number) => elements.find((e: any) => e.id === id)?.web_name || 'Unknown';

  const renderList = (data: typeof stats.mostCaptained, label: string) => (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{label}</div>
      {data.slice(0, 3).map((item, idx) => (
        <div key={item.element} className={styles.item}>
          <div className={styles.rank}>{idx + 1}</div>
          <div className={styles.name}>{getPlayerName(item.element)}</div>
          <div className={styles.value}>
            {item.count}
            <span className={styles.percent}>
              ({Math.round((item.count / item.totalManagers) * 100)}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <StatCard title="League Insights">
      <div className={styles.grid}>
        {renderList(stats.mostCaptained, 'Most Captained')}
        {renderList(stats.mostTransferredIn, 'Most Bought')}
        {renderList(stats.mostTransferredOut, 'Most Sold')}
      </div>
    </StatCard>
  );
};
