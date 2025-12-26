import { Suspense } from 'react';


import { DetailPanel } from './DetailPanel';
import { PlayerComparisonAsync } from '../../../PlayerDetail/Components/Player/PlayerComparisonAsync';
import { BestXIAsync } from '../../../Tools/Components/BestXI/BestXIAsync';
import { DetailPanelSkeleton } from './Skeletons/DetailPanelSkeleton';

type DetailPageProps = {
  leagueId: number;
  managerId?: number;
  view: string;
};

export const DetailPanelAsync = (props: DetailPageProps) => {
  return (
    <Suspense fallback={<DetailPanelSkeleton />}>
      <DetailPanelAsyncInner {...props} />
    </Suspense>
  );
};

const DetailPanelAsyncInner = async ({ leagueId, managerId, view }: DetailPageProps) => {
  if (view === 'players') {
    return <PlayerComparisonAsync />;
  }

  if (view === 'dream-team') {
    return <BestXIAsync leagueId={leagueId} managerId={managerId} mode="dream" />;
  }

  if (view === 'my-team') {
    return <BestXIAsync leagueId={leagueId} managerId={managerId} mode="manager" />;
  }
  
  return (
    <DetailPanel
      leagueId={leagueId}
      managerId={managerId}
      view={view}
    />
  );
};
