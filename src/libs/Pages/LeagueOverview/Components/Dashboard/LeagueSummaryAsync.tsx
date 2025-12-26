import { cacheLife, cacheTag } from 'next/cache';
import { getGameweekStatus } from '../../../../Fpl/Utils/GameweekStatus';
import { buildLiveTable } from '../../../../Fpl/Services/FPLEngine';
import { LeagueSummaryServer } from './LeagueSummaryServer';

type Props = {
  leagueId: number;
};

export const LeagueSummaryAsync = async ({ leagueId }: Props) => {
  'use cache'
  cacheTag('league-summary', `league-${leagueId}`);
  
  const { isLive } = await getGameweekStatus();
  cacheLife(isLive ? 'live' : 'gameweek' as any);

  const scores = await buildLiveTable(leagueId);
  return <LeagueSummaryServer scores={scores} leagueId={leagueId} />;
};
