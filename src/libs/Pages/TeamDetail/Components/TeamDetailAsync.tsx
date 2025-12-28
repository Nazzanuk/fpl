import { Suspense } from 'react';
import { getBootstrapTeams, getBootstrapElements } from '../../../Fpl/Data/Client/BootstrapClient';
import { TeamDetailInner } from './TeamDetailInner';
// import { TeamDetailSkeleton } from './TeamDetailSkeleton';

type Props = {
  leagueId: number;
  teamId: number;
};

export const TeamDetailAsync = (props: Props) => {
  return (
    <Suspense fallback={<div>Loading Team...</div>}>
      <TeamDetailAsyncInner {...props} />
    </Suspense>
  );
};

const TeamDetailAsyncInner = async ({ leagueId, teamId }: Props) => {
  const [teams, elements] = await Promise.all([
    getBootstrapTeams(),
    getBootstrapElements(),
  ]);
  const team = teams.find(t => t.id === teamId);

  if (!team) {
    return <div>Team not found</div>;
  }

  // Also get players for this team
  const players = elements.filter(p => p.team === teamId);

  return (
    <TeamDetailInner 
      team={team} 
      players={players}
      leagueId={leagueId}
    />
  );
};
