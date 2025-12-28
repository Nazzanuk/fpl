import type { ManagerTeamPayload, LiveElementStats, BootstrapStatic } from '../../../Fpl/Types';
import { PlayerCard } from './PlayerCard';
import styles from './PitchView.module.css';

type Props = {
  team: ManagerTeamPayload;
  liveStats: Map<number, LiveElementStats>;
  bootstrap: BootstrapStatic;
  leagueId: number;
};

export const PitchView = ({ team, liveStats, bootstrap, leagueId }: Props) => {
  const getPlayerDetails = (elementId: number) => {
    const element = bootstrap.elements.find((e) => e.id === elementId);
    const teamObj = bootstrap.teams.find((t) => t.id === element?.team);
    return {
      name: element?.web_name || 'Unknown',
      teamCode: teamObj?.code || 3, // Default to Arsenal (3) if unknown, but should exist
      elementType: element?.element_type || 1,
    };
  };

  const picksWithDetails = team.picks.map((pick) => {
    const details = getPlayerDetails(pick.element);
    const stats = liveStats.get(pick.element);
    return {
      ...pick,
      ...details,
      points: stats?.total_points || 0,
    };
  });

  // Separate starters and bench
  const starters = picksWithDetails.filter((p) => p.position <= 11);
  const bench = picksWithDetails.filter((p) => p.position > 11);

  // Group starters by position (GKP=1, DEF=2, MID=3, FWD=4)
  const gkp = starters.filter((p) => p.elementType === 1);
  const def = starters.filter((p) => p.elementType === 2);
  const mid = starters.filter((p) => p.elementType === 3);
  const fwd = starters.filter((p) => p.elementType === 4);

  return (
    <div className={styles.pitchContainer}>
      <div className={styles.row}>
        {gkp.map((p) => (
          <PlayerCard
            key={p.element}
            id={p.element}
            leagueId={leagueId}
            name={p.name}
            points={p.points}
            teamCode={p.teamCode}
            isCaptain={p.is_captain}
            isViceCaptain={p.is_vice_captain}
            multiplier={p.multiplier}
          />
        ))}
      </div>
      <div className={styles.row}>
        {def.map((p) => (
          <PlayerCard
            key={p.element}
            id={p.element}
            leagueId={leagueId}
            name={p.name}
            points={p.points}
            teamCode={p.teamCode}
            isCaptain={p.is_captain}
            isViceCaptain={p.is_vice_captain}
            multiplier={p.multiplier}
          />
        ))}
      </div>
      <div className={styles.row}>
        {mid.map((p) => (
          <PlayerCard
            key={p.element}
            id={p.element}
            leagueId={leagueId}
            name={p.name}
            points={p.points}
            teamCode={p.teamCode}
            isCaptain={p.is_captain}
            isViceCaptain={p.is_vice_captain}
            multiplier={p.multiplier}
          />
        ))}
      </div>
      <div className={styles.row}>
        {fwd.map((p) => (
          <PlayerCard
            key={p.element}
            id={p.element}
            leagueId={leagueId}
            name={p.name}
            points={p.points}
            teamCode={p.teamCode}
            isCaptain={p.is_captain}
            isViceCaptain={p.is_vice_captain}
            multiplier={p.multiplier}
          />
        ))}
      </div>

      <div className={styles.bench}>
        {bench.map((p) => (
          <PlayerCard
            key={p.element}
            id={p.element}
            leagueId={leagueId}
            name={p.name}
            points={p.points}
            teamCode={p.teamCode}
            isCaptain={p.is_captain}
            isViceCaptain={p.is_vice_captain}
            multiplier={p.multiplier}
          />
        ))}
      </div>
    </div>
  );
};
