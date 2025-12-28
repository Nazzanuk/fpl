import { HistoryPage } from '@/libs/Pages/History/HistoryPage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function HistoryRoute({ params }: PageProps) {
  return <HistoryPage params={params} />;
}
