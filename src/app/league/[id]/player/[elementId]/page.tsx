import { Suspense } from 'react';
import { PlayerDetailAsync } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailAsync';
import { PlayerDetailSkeleton } from '@/libs/Pages/PlayerDetail/Components/Player/PlayerDetailSkeleton';

type PageProps = {
  params: Promise<{ id: string; elementId: string }>;
};

/**
 * Full-page route for player detail.
 * The page is SYNCHRONOUS - param extraction happens inside Suspense
 * to avoid blocking the page shell. PlayerDetailAsync manages its own
 * internal Suspense for data fetching once it has the params.
 */
export default function PlayerPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PlayerDetailSkeleton />}>
      <PlayerPageInner params={params} />
    </Suspense>
  );
}

const PlayerPageInner = async ({ params }: PageProps) => {
  const { id, elementId } = await params;
  
  return (
    <PlayerDetailAsync
      elementId={parseInt(elementId, 10)}
      leagueId={parseInt(id, 10)}
    />
  );
};
