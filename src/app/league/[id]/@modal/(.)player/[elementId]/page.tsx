import { Suspense } from 'react';
import { PlayerDetailAsync } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailAsync';
import { PlayerDetailSkeleton } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailSkeleton';

type PageProps = {
  params: Promise<{ id: string; elementId: string }>;
};



async function ModalContent({ params }: PageProps) {
  const { id, elementId } = await params;
  const leagueId = parseInt(id, 10);
  const playerElementId = parseInt(elementId, 10);

  return (
    <PlayerDetailAsync
      elementId={playerElementId}
      leagueId={leagueId}
    />
  );
}

export default function PlayerModalPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PlayerDetailSkeleton />}>
      <ModalContent params={params} />
    </Suspense>
  );
}
