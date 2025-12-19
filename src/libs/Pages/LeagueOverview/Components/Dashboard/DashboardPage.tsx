import { DashboardHeader } from './DashboardHeader';
import { MatchTickerAsync } from './MatchTickerAsync';
import { QuickActionsClient } from './QuickActionsClient';
import { StandingsAsync } from './StandingsAsync';
import { DetailPanel } from './DetailPanel';
import { PlayerComparisonAsync } from '../../../PlayerDetail/Components/Player/PlayerComparisonAsync';
import { BestXIAsync } from '../../../Tools/Components/BestXI/BestXIAsync';
import styles from './Dashboard.module.css';

type Props = {
  leagueId: number;
  selectedManagerId?: number;
  view: string;
};

export const DashboardPage = ({ leagueId, selectedManagerId, view }: Props) => {
  return (
    <div className={styles.container}>
      <DashboardHeader leagueId={leagueId} />
      <MatchTickerAsync />
      <QuickActionsClient
        leagueId={leagueId}
        currentView={view}
        selectedManagerId={selectedManagerId}
      />
      <div className={styles.main}>
        <section className={styles.standings}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Standings</h2>
          </div>
          <StandingsAsync
            leagueId={leagueId}
            selectedManagerId={selectedManagerId}
            view={view}
          />
        </section>
        <section className={styles.detail}>
          {view === 'players' && <PlayerComparisonAsync />}
          {view === 'best-xi' && <BestXIAsync leagueId={leagueId} managerId={selectedManagerId} />}
          {view !== 'players' && view !== 'best-xi' && (
            <DetailPanel
              leagueId={leagueId}
              managerId={selectedManagerId}
              view={view}
            />
          )}
        </section>
      </div>
    </div>
  );
};
