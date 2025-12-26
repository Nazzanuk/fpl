import { StandingsAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/StandingsAsync';

type Props = {
  params: Promise<{ id: string }>;
};

export default function StandingsSlot({ params }: Props) {
  return <StandingsAsync params={params} />;
}
