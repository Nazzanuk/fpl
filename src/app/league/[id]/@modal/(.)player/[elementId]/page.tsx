import { Suspense } from 'react';
import { PlayerDetailAsync } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailAsync';
import { PlayerDetailSkeleton } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailSkeleton';

type PageProps = {
  params: Promise<{ id: string; elementId: string }>;
};

/**
 * Modal route for player detail.
 * Page is synchronous - param extraction is inside Suspense boundary.
 */
export default function PlayerModalPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PlayerDetailSkeleton />}>
      <PlayerModalInner params={params} />
    </Suspense>
  );
}

const PlayerModalInner = async ({ params }: PageProps) => {
  const { id, elementId } = await params;
  
  return (
    <PlayerDetailAsync
      elementId={parseInt(elementId, 10)}
      leagueId={parseInt(id, 10)}
    />
  );
};
