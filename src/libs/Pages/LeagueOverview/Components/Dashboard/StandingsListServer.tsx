'use client';

import { useRouter } from 'next/navigation';
import { LiveManagerScore } from '../../../../Fpl/Types';
import { StandingsList } from './StandingsList';

type Props = {
  leagueId: number;
  scores: LiveManagerScore[];
  selectedManagerId?: number;
  view: string;
};

export const StandingsListServer = ({
  leagueId,
  scores,
  selectedManagerId,
  view,
}: Props) => {
  const router = useRouter();

  const handleSelectManager = (managerId: number) => {
    const params = new URLSearchParams();
    params.set('manager', String(managerId));
    if (view && view !== 'standings') params.set('view', view);
    router.push(`/league/${leagueId}?${params.toString()}`, { scroll: false });
  };

  return (
    <StandingsList
      scores={scores}
      selectedId={selectedManagerId || null}
      onSelect={handleSelectManager}
    />
  );
};
