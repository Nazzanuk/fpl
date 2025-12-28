import { ChipsPage } from '@/libs/Pages/Chips/ChipsPage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ChipsRoute({ params }: PageProps) {
  return <ChipsPage params={params} />;
}
