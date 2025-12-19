import { Suspense } from 'react';
import { PlayerDetailAsync } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailAsync';
import { PlayerDetailSkeleton } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailSkeleton';

type PageProps = {
  params: Promise<{ id: string; elementId: string }>;
};

export default async function PlayerPage({ params }: PageProps) {
  const { id, elementId } = await params;
  const leagueId = parseInt(id, 10);
  const playerElementId = parseInt(elementId, 10);

  return (
    <Suspense fallback={<PlayerDetailSkeleton />}>
      <PlayerDetailAsync
        elementId={playerElementId}
        leagueId={leagueId}
      />
    </Suspense>
  );
}
