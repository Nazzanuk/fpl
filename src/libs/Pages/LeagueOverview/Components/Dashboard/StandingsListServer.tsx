'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LiveManagerScore } from '../../../../Fpl/Types';
import { StandingsList } from './StandingsList';

type Props = {
  leagueId: number;
  scores: LiveManagerScore[];
};

// Derive current view and manager from pathname
const parsePathname = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  // Expected patterns:
  // /league/[id] - default (standings)
  // /league/[id]/[view] - view-only (players, fixtures, etc.)
  // /league/[id]/manager/[managerId] - manager default
  // /league/[id]/manager/[managerId]/[view] - manager + view

  let currentView = 'standings';
  let managerId: number | undefined;

  if (parts[0] === 'league' && parts.length >= 2) {
    if (parts[2] === 'manager' && parts[3]) {
      managerId = parseInt(parts[3], 10);
      currentView = parts[4] || 'standings';
    } else if (parts[2]) {
      currentView = parts[2];
    }
  }

  return { currentView, managerId };
};

export const StandingsListServer = ({
  leagueId,
  scores,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const { currentView, managerId } = parsePathname(pathname);

  const handleSelectManager = (selectedManagerId: number) => {
    // Navigate to the manager with current view, or default to standings
    const view = currentView || 'standings';
    router.push(`/league/${leagueId}/manager/${selectedManagerId}/${view}`, { scroll: false });
  };

  return (
    <StandingsList
      scores={scores}
      selectedId={managerId || null}
      onSelect={handleSelectManager}
    />
  );
};
