import { DifferentialsPage } from '@/libs/Pages/Differentials/DifferentialsPage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function DifferentialsRoute({ params }: PageProps) {
  return <DifferentialsPage params={params} />;
}
