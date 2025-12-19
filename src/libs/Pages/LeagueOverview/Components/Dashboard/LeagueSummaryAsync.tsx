import { buildLiveTable } from '../../../../Fpl/Services/FPLEngine';
import { LeagueSummaryServer } from './LeagueSummaryServer';

type Props = {
  leagueId: number;
};

export const LeagueSummaryAsync = async ({ leagueId }: Props) => {
  const scores = await buildLiveTable(leagueId);
  return <LeagueSummaryServer scores={scores} leagueId={leagueId} />;
};
