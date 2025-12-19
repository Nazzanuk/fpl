import { Suspense } from 'react';
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
import { LeagueSummaryAsync } from './LeagueSummaryAsync';
import { DetailPanelSkeleton } from './Skeletons/DetailPanelSkeleton';
import styles from './Dashboard.module.css';

type Props = {
  leagueId: number;
  managerId?: number;
  view: string;
};

const WrapSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<DetailPanelSkeleton />}>{children}</Suspense>
);

export const DetailPanel = ({ leagueId, managerId, view }: Props) => {
  const defaultEmpty = (
    <Suspense fallback={<div className={styles.emptyDetail}>Loading overview...</div>}>
      <LeagueSummaryAsync leagueId={leagueId} />
    </Suspense>
  );

  switch (view) {
    case 'differentials':
      return managerId ? (
        <DifferentialsView leagueId={leagueId} managerId={managerId} />
      ) : (
        defaultEmpty
      );
    case 'ownership':
      return <OwnershipView leagueId={leagueId} />;
    case 'h2h':
      return (
        <WrapSuspense>
          <HeadToHeadAsync leagueId={leagueId} />
        </WrapSuspense>
      );
    case 'history':
      return managerId ? (
        <WrapSuspense>
          <ManagerHistoryAsync leagueId={leagueId} managerId={managerId} />
        </WrapSuspense>
      ) : (
        defaultEmpty
      );
    case 'trends':
      return (
        <WrapSuspense>
          <LeagueTrendsAsync leagueId={leagueId} />
        </WrapSuspense>
      );
    case 'fdr':
      return (
        <WrapSuspense>
          <FDRPlannerAsync />
        </WrapSuspense>
      );
    case 'transfers':
      return (
        <WrapSuspense>
          <TransferPlannerAsync />
        </WrapSuspense>
      );
    case 'chips':
      return managerId ? (
        <WrapSuspense>
          <ChipAdvisorAsync managerId={managerId} />
        </WrapSuspense>
      ) : (
        defaultEmpty
      );
    case 'top':
      return (
        <WrapSuspense>
          <TopPerformersAsync />
        </WrapSuspense>
      );
    case 'fixtures':
      return (
        <WrapSuspense>
          <FixturesAsync />
        </WrapSuspense>
      );
    default:
      return managerId ? (
        <ManagerPanel leagueId={leagueId} managerId={managerId} rank={0} currentGw={0} />
      ) : (
        defaultEmpty
      );
  }
};
