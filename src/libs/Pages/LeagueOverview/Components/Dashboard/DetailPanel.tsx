import { ManagerPanel } from './ManagerPanel';
import { DifferentialsView } from './DifferentialsView';
import { OwnershipView } from './OwnershipView';
import { HeadToHeadAsync } from './HeadToHeadAsync';
import { ManagerHistoryAsync } from '../../../ManagerDetail/Components/ManagerHistory/ManagerHistoryAsync';
import { LeagueTrendsAsync } from '../LeagueTrends/LeagueTrendsAsync';
import { FDRPlannerAsync } from '../../../Tools/Components/FDRPlanner/FDRPlannerAsync';
import { TransferPlannerAsync } from '../../../Tools/Components/TransferPlanner/TransferPlannerAsync';
import { ChipAdvisorAsync } from '../../../Tools/Components/ChipAdvisor/ChipAdvisorAsync';
import { TopPerformersAsync } from '../../../Tools/Components/TopPerformers/TopPerformersAsync';
import { FixturesAsync } from '../../../Tools/Components/Fixtures/FixturesAsync';
import styles from './Dashboard.module.css';

type Props = {
  leagueId: number;
  managerId?: number;
  view: string;
};

export const DetailPanel = ({ leagueId, managerId, view }: Props) => {
  switch (view) {
    case 'differentials':
      return managerId ? (
        <DifferentialsView leagueId={leagueId} managerId={managerId} />
      ) : (
        <div className={styles.emptyDetail}>Select a manager to see differentials</div>
      );
    case 'ownership':
      return <OwnershipView leagueId={leagueId} />;
    case 'h2h':
      return <HeadToHeadAsync leagueId={leagueId} />;
    case 'history':
      return managerId ? (
        <ManagerHistoryAsync leagueId={leagueId} managerId={managerId} />
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
      return managerId ? (
        <ChipAdvisorAsync managerId={managerId} />
      ) : (
        <div className={styles.emptyDetail}>Select a manager to see chip advice</div>
      );
    case 'top':
      return <TopPerformersAsync />;
    case 'fixtures':
      return <FixturesAsync />;
    default:
      return managerId ? (
        <ManagerPanel leagueId={leagueId} managerId={managerId} rank={0} currentGw={0} />
      ) : (
        <div className={styles.emptyDetail}>Select a manager</div>
      );
  }
};
