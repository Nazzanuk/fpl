import { Suspense } from 'react';


import { DetailPanel } from './DetailPanel';
import { PlayerComparisonAsync } from '../../../PlayerDetail/Components/Player/PlayerComparisonAsync';
import { BestXIAsync } from '../../../Tools/Components/BestXI/BestXIAsync';
import { DetailPanelSkeleton } from './Skeletons/DetailPanelSkeleton';

// Define locally since shared import is missing
type DetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string; view?: string }>;
  viewOverride?: string;
};

export const DetailPanelAsync = (props: DetailPageProps) => {
  return (
    <Suspense fallback={<DetailPanelSkeleton />}>
      <DetailPanelAsyncInner {...props} />
    </Suspense>
  );
};

const DetailPanelAsyncInner = async ({ params, searchParams, viewOverride }: DetailPageProps) => {
  const { id } = await params;
  const { manager, view } = await searchParams;
  const leagueId = parseInt(id, 10);
  const selectedManagerId = manager ? parseInt(manager, 10) : undefined;
  const currentView = viewOverride || view || 'standings';

  if (currentView === 'players') {
    return <PlayerComparisonAsync />;
  }

  if (currentView === 'best-xi') {
    return <BestXIAsync leagueId={leagueId} managerId={selectedManagerId} />;
  }
  
  return (
    <DetailPanel
      leagueId={leagueId}
      managerId={selectedManagerId}
      view={currentView}
    />
  );
};
