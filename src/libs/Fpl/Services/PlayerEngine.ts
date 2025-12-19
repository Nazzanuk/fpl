/**
 * Player Engine - Player-specific business logic
 */

import {
  getBootstrapStatic,
  getElementSummary,
  getLeagueManagers,
  getManagerPicks,
} from '../Data/Client/FPLApiClient';
import pLimit from 'p-limit';

const limit = pLimit(5);

/**
 * Get detailed player information with league ownership
 */
export async function getPlayerDetail(elementId: number, leagueId: number) {
  const [bootstrap, elementSummary] = await Promise.all([
    getBootstrapStatic(),
    getElementSummary(elementId),
  ]);

  const currentEvent = bootstrap.events.find((e: any) => e.is_current);
  const element = bootstrap.elements.find((el: any) => el.id === elementId);
  const team = bootstrap.teams.find((t: any) => t.id === element?.team);

  if (!element) {
    throw new Error(`Player with ID ${elementId} not found`);
  }

  // Fetch league ownership if leagueId provided
  let leagueOwnership = null;
  if (leagueId && currentEvent) {
    leagueOwnership = await getPlayerLeagueOwnership(elementId, leagueId, currentEvent.id);
  }

  return {
    id: element.id,
    webName: element.web_name,
    firstName: element.first_name,
    secondName: element.second_name,
    fullName: `${element.first_name} ${element.second_name}`,
    team: {
      id: team?.id || 0,
      name: team?.name || '',
      shortName: team?.short_name || '',
    },
    teamCode: element.team_code || 0,
    teamName: team?.name || '',
    position: getPositionName(element.element_type),
    positionShort: getPositionName(element.element_type),
    price: element.now_cost / 10,
    status: getPlayerStatus(element.status),
    form: element.form,
    totalPoints: element.total_points,
    pointsPerGame: element.points_per_game,
    selectedByPercent: element.selected_by_percent,
    transfersIn: element.transfers_in,
    transfersOut: element.transfers_out,
    transfersInEvent: element.transfers_in_event,
    transfersOutEvent: element.transfers_out_event,
    minutes: element.minutes,
    goalsScored: element.goals_scored,
    assists: element.assists,
    cleanSheets: element.clean_sheets,
    goalsConceded: element.goals_conceded,
    bonus: element.bonus,
    bps: element.bps,
    influence: element.influence,
    creativity: element.creativity,
    threat: element.threat,
    ictIndex: element.ict_index,
    expectedGoals: element.expected_goals,
    expectedAssists: element.expected_assists,
    expectedGoalInvolvements: element.expected_goal_involvements,
    expectedGoalsConceded: element.expected_goals_conceded,
    news: element.news || '',
    chanceOfPlaying: element.chance_of_playing_next_round,
    currentGwPoints: element.event_points || 0,
    currentGwMinutes: 0, // Would need live data
    currentGwBonus: 0, // Would need live data
    currentGwBps: 0, // Would need live data
    fixtures: elementSummary.fixtures?.slice(0, 5).map((f: any) => ({
      eventId: f.event,
      eventName: `GW${f.event}`,
      opponent: f.team_h === element.team ? bootstrap.teams.find((t: any) => t.id === f.team_a)?.name : bootstrap.teams.find((t: any) => t.id === f.team_h)?.name,
      opponentShort: f.team_h === element.team ? bootstrap.teams.find((t: any) => t.id === f.team_a)?.short_name : bootstrap.teams.find((t: any) => t.id === f.team_h)?.short_name,
      isHome: f.team_h === element.team,
      difficulty: f.team_h === element.team ? f.team_h_difficulty : f.team_a_difficulty,
      kickoffTime: f.kickoff_time,
    })) || [],
    history: elementSummary.history?.map((h: any) => ({
      gameweek: h.round,
      opponent: bootstrap.teams.find((t: any) => t.id === h.opponent_team)?.short_name || '',
      opponentShort: bootstrap.teams.find((t: any) => t.id === h.opponent_team)?.short_name || '',
      isHome: h.was_home,
      points: h.total_points,
      minutes: h.minutes,
      goals: h.goals_scored,
      assists: h.assists,
      bonus: h.bonus,
      bps: h.bps,
      value: h.value / 10,
    })) || [],
    leagueOwnership: leagueOwnership || {
      owners: [],
      ownershipPercent: 0,
      captainCount: 0,
    },
  };
}

function getPositionName(elementType: number): 'GKP' | 'DEF' | 'MID' | 'FWD' {
  switch (elementType) {
    case 1: return 'GKP';
    case 2: return 'DEF';
    case 3: return 'MID';
    case 4: return 'FWD';
    default: return 'MID';
  }
}

function getPlayerStatus(status: string): 'available' | 'doubtful' | 'injured' | 'suspended' | 'unavailable' {
  switch (status) {
    case 'a': return 'available';
    case 'd': return 'doubtful';
    case 'i': return 'injured';
    case 's': return 'suspended';
    case 'u': return 'unavailable';
    default: return 'available';
  }
}

async function getPlayerLeagueOwnership(elementId: number, leagueId: number, eventId: number) {
  const leagueData = await getLeagueManagers(leagueId);
  const managers = leagueData.standings.results;

  const allPicks = await Promise.all(
    managers.map((m: any) => limit(() => getManagerPicks(m.entry, eventId)))
  );

  const owners: any[] = [];
  let captainCount = 0;

  allPicks.forEach((picks: any, index: number) => {
    const manager = managers[index];
    const pick = picks.picks.find((p: any) => p.element === elementId);

    if (pick) {
      owners.push({
        managerId: manager.entry,
        managerName: manager.player_name,
        isCaptain: pick.is_captain,
      });

      if (pick.is_captain) {
        captainCount++;
      }
    }
  });

  return {
    owners,
    ownershipPercent: (owners.length / managers.length) * 100,
    captainCount,
  };
}
