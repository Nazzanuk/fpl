import { LiveManagerScore } from '../../../../Fpl/Types';
import { DashboardClient } from './DashboardClient';
import { ManagerPanel } from './ManagerPanel';
import { DifferentialsView } from './DifferentialsView';
import { OwnershipView } from './OwnershipView';
import { ManagerHistoryAsync } from '../../../ManagerDetail/Components/ManagerHistory/ManagerHistoryAsync';
import { LeagueTrendsAsync } from '../LeagueTrends/LeagueTrendsAsync';
import { FDRPlannerAsync } from '../../../Tools/Components/FDRPlanner/FDRPlannerAsync';
import { TransferPlannerAsync } from '../../../Tools/Components/TransferPlanner/TransferPlannerAsync';
import { ChipAdvisorAsync } from '../../../Tools/Components/ChipAdvisor/ChipAdvisorAsync';
import { TopPerformersAsync } from '../../../Tools/Components/TopPerformers/TopPerformersAsync';
import { FixturesAsync } from '../../../Tools/Components/Fixtures/FixturesAsync';
import styles from './Dashboard.module.css';

type Fixture = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'finished' | 'upcoming';
  minutes: number;
  kickoff: string;
};

type Props = {
  leagueId: number;
  leagueName: string;
  scores: LiveManagerScore[];
  currentGw: number;
  fixtures: Fixture[];
  selectedManagerId?: number;
  view?: string;
};

export const Dashboard = ({
  leagueId,
  leagueName,
  scores,
  currentGw,
  fixtures,
  selectedManagerId,
  view = 'standings',
}: Props) => {
  const effectiveManagerId = selectedManagerId || scores[0]?.managerId;
  const selectedRank = scores.findIndex(s => s.managerId === effectiveManagerId) + 1;

  const renderDetailView = () => {
    switch (view) {
      case 'differentials':
        return effectiveManagerId ? (
          <DifferentialsView leagueId={leagueId} managerId={effectiveManagerId} />
        ) : (
          <div className={styles.emptyDetail}>Select a manager to see differentials</div>
        );
      case 'ownership':
        return <OwnershipView leagueId={leagueId} />;
      case 'h2h':
        return null;
      case 'history':
        return effectiveManagerId ? (
          <ManagerHistoryAsync leagueId={leagueId} managerId={effectiveManagerId} />
        ) : (
          <div className={styles.emptyDetail}>Select a manager to see history</div>
        );
      case 'trends':
        return <LeagueTrendsAsync leagueId={leagueId} />;
      case 'fdr':
        return <FDRPlannerAsync />;
      case 'transfers':
        return <TransferPlannerAsync />;
      case 'chips':
        return effectiveManagerId ? (
          <ChipAdvisorAsync managerId={effectiveManagerId} />
        ) : (
          <div className={styles.emptyDetail}>Select a manager to see chip advice</div>
        );
      case 'top':
        return <TopPerformersAsync />;
      case 'fixtures':
        return <FixturesAsync />;
      default:
        return effectiveManagerId ? (
          <ManagerPanel
            leagueId={leagueId}
            managerId={effectiveManagerId}
            rank={selectedRank}
            currentGw={currentGw}
          />
        ) : (
          <div className={styles.emptyDetail}>Select a manager</div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <DashboardClient
        leagueId={leagueId}
        leagueName={leagueName}
        scores={scores}
        currentGw={currentGw}
        fixtures={fixtures}
        selectedManagerId={effectiveManagerId}
        view={view}
      >
        {renderDetailView()}
      </DashboardClient>
    </div>
  );
};
