import { Suspense } from 'react';
import { DetailPanelAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DetailPanelAsync';
import { DetailPanelSkeleton } from '@/libs/Pages/LeagueOverview/Components/Dashboard/Skeletons/DetailPanelSkeleton';

type Props = {
  params: Promise<{ id: string; managerId: string }>;
};

export default function ManagerPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailPanelSkeleton />}>
      <ManagerPageInner params={params} />
    </Suspense>
  );
}

const ManagerPageInner = async ({ params }: Props) => {
  const { id, managerId } = await params;
  const leagueId = parseInt(id, 10);
  const selectedManagerId = parseInt(managerId, 10);

  return (
    <DetailPanelAsync
      leagueId={leagueId}
      managerId={selectedManagerId}
      view="standings"
    />
  );
};
