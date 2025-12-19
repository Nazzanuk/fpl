import { DashboardPage } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DashboardPage';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string; view?: string }>;
};

export default async function LeaguePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { manager, view } = await searchParams;
  const leagueId = parseInt(id, 10);
  const selectedManagerId = manager ? parseInt(manager, 10) : undefined;

  return (
    <DashboardPage
      leagueId={leagueId}
      selectedManagerId={selectedManagerId}
      view={view || 'standings'}
    />
  );
}
