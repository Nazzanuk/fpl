import { DetailPanelAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DetailPanelAsync';

type Props = {
  params: Promise<{ id: string; managerId: string; view: string[] }>;
};

export default async function ManagerViewPage({ params }: Props) {
  const { id, managerId, view } = await params;
  const leagueId = parseInt(id, 10);
  const selectedManagerId = parseInt(managerId, 10);
  const currentView = view[0];

  return (
    <DetailPanelAsync
      leagueId={leagueId}
      managerId={selectedManagerId}
      view={currentView}
    />
  );
}
