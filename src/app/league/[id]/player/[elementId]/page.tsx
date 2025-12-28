import { Suspense } from 'react';
import { PlayerDetailAsync } from '../../../../../libs/Pages/PlayerDetail/Components/Player/PlayerDetailAsync';
import { PlayerDetailSkeleton } from '../../../../../libs/Pages/PlayerDetail/Components/Player/PlayerDetailSkeleton';
import { Breadcrumbs } from '../../../../../libs/Shared/Components/Breadcrumbs/Breadcrumbs';
import { getBootstrapElements } from '../../../../../libs/Fpl/Data/Client/BootstrapClient';

type PageProps = {
  params: Promise<{ id: string; elementId: string }>;
};

/**
 * Full-page route for player detail.
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
  const pId = parseInt(elementId, 10);

  // Quick fetch for breadcrumb label
  const elements = await getBootstrapElements();
  const playerInfo = elements.find((e: any) => e.id === pId);
  const playerName = playerInfo?.web_name || 'Player';
  
  return (
    <div style={{ padding: '1rem' }}>
      <Breadcrumbs
        items={[
          { label: 'League', href: `/league/${id}` },
          { label: playerName },
        ]}
      />
      <PlayerDetailAsync
        elementId={pId}
        leagueId={parseInt(id, 10)}
      />
    </div>
  );
};
