import { DashboardPage } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DashboardPage';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string; view?: string }>;
};

export default function LeaguePage(props: PageProps) {
  return <DashboardPage {...props} />;
}
