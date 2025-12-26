import { DetailPanelAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DetailPanelAsync';

type Props = {
  params: Promise<{ id: string; view: string[] }>;
};

export default async function GlobalViewPage({ params }: Props) {
  const { id, view } = await params;
  const leagueId = parseInt(id, 10);
  const currentView = view[0];

  return <DetailPanelAsync leagueId={leagueId} view={currentView} />;
}
