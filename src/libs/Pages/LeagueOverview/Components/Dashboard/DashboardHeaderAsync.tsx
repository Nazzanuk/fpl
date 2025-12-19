import { DashboardHeader } from './DashboardHeader';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const DashboardHeaderAsync = async ({ params }: PageProps) => {
  const { id } = await params;
  const leagueId = parseInt(id, 10);
  
  return <DashboardHeader leagueId={leagueId} />;
};
