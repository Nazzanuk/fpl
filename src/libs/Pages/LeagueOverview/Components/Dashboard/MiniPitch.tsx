'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlayerHoverCard } from '../../../../Shared/Components/PlayerHoverCard/PlayerHoverCard';
import styles from './MiniPitch.module.css';

type Pick = {
  element: number;
  position: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
  name: string;
  teamCode: number;
  teamName: string;
  elementType: number;
  points: number;
  minutes: number;
  nextFixture: { opponent: string; isHome: boolean; difficulty: number } | null;
};

type Props = {
  picks: Pick[];
  leagueId?: number;
};

export const MiniPitch = ({ picks, leagueId }: Props) => {
  const router = useRouter();
  const [hoveredPlayerId, setHoveredPlayerId] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const starters = picks.filter(p => p.position <= 11);
  const bench = picks.filter(p => p.position > 11).sort((a, b) => a.position - b.position);

  const gkp = starters.filter(p => p.elementType === 1);
  const def = starters.filter(p => p.elementType === 2);
  const mid = starters.filter(p => p.elementType === 3);
  const fwd = starters.filter(p => p.elementType === 4);

  const handlePlayerClick = (elementId: number) => {
    if (leagueId) {
      router.push(`/league/${leagueId}/player/${elementId}`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Calculate total with auto-subs
  const activeSquad = [...starters];
  bench.forEach(benchPlayer => {
    if (benchPlayer.minutes === 0) return;
    const subOutIndex = activeSquad.findIndex(starter => {
      if (starter.minutes > 0) return false;
      if (starter.elementType === 1) return benchPlayer.elementType === 1;
      if (benchPlayer.elementType === 1) return false;
      return true;
    });
    if (subOutIndex !== -1) {
      activeSquad[subOutIndex] = benchPlayer;
    }
  });

  const totalPoints = activeSquad.reduce((sum, p) => {
    return sum + p.points * p.multiplier;
  }, 0);

  const benchPoints = bench.reduce((sum, p) => sum + p.points, 0);

  const hoveredPlayer = picks.find(p => p.element === hoveredPlayerId);

  return (
    <div className={styles.container} onMouseMove={handleMouseMove}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitleContainer}>
          <span className="material-symbols-sharp" style={{ fontSize: '18px', color: 'var(--gold)' }}>
            stadium
          </span>
          <span className={styles.headerTitle}>Squad View</span>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.headerStat}>
            <span className={styles.statValue}>{totalPoints}</span>
            <span className={styles.statLabel}>pts</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={styles.main}>
        {/* Vertical Pitch - GK at top, FWD at bottom */}
        <div className={styles.pitch}>
          <div className={styles.pitchOverlay} />
          
          <div className={styles.pitchLines}>
            <div className={styles.halfwayLine} />
            <div className={styles.centerCircle} />
            <div className={styles.penaltyAreaTop} />
            <div className={styles.penaltyAreaBottom} />
          </div>

          <div className={styles.formation}>
            <div className={styles.pitchRow} data-position="gkp">
              {gkp.map(p => (
                <PlayerCard 
                  key={p.element} 
                  player={p} 
                  onPlayerClick={handlePlayerClick}
                  onHover={setHoveredPlayerId}
                />
              ))}
            </div>
            <div className={styles.pitchRow} data-position="def">
              {def.map(p => (
                <PlayerCard 
                  key={p.element} 
                  player={p} 
                  onPlayerClick={handlePlayerClick}
                  onHover={setHoveredPlayerId}
                />
              ))}
            </div>
            <div className={styles.pitchRow} data-position="mid">
              {mid.map(p => (
                <PlayerCard 
                  key={p.element} 
                  player={p} 
                  onPlayerClick={handlePlayerClick}
                  onHover={setHoveredPlayerId}
                />
              ))}
            </div>
            <div className={styles.pitchRow} data-position="fwd">
              {fwd.map(p => (
                <PlayerCard 
                  key={p.element} 
                  player={p} 
                  onPlayerClick={handlePlayerClick}
                  onHover={setHoveredPlayerId}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bench - remains sidebar style */}
        <div className={styles.bench}>
          <div className={styles.benchHeader}>
            <span className={styles.benchTitle}>Subs</span>
            <span className={styles.benchPoints}>{benchPoints}</span>
          </div>
          <div className={styles.benchPlayers}>
            {bench.map((p, idx) => (
              <div key={p.element} className={styles.benchSlot}>
                <span className={styles.benchOrder}>{idx + 1}</span>
                <PlayerCard 
                  player={p} 
                  isBench 
                  onPlayerClick={handlePlayerClick}
                  onHover={setHoveredPlayerId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {hoveredPlayer && (
        <PlayerHoverCard
          playerName={hoveredPlayer.name}
          teamName={hoveredPlayer.teamName}
          points={hoveredPlayer.points * hoveredPlayer.multiplier}
          minutes={hoveredPlayer.minutes}
          nextFixture={hoveredPlayer.nextFixture}
          position={mousePos}
        />
      )}
    </div>
  );
};

type PlayerCardProps = {
  player: Pick;
  isBench?: boolean;
  onPlayerClick: (elementId: number) => void;
  onHover: (id: number | null) => void;
};

const PlayerCard = ({ player, isBench = false, onPlayerClick, onHover }: PlayerCardProps) => {
  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.teamCode}-110.png`;
  const didNotPlay = player.minutes === 0;
  const displayPoints = player.points * player.multiplier;
  const isHighScorer = displayPoints >= 10;
  // const isLowScorer = displayPoints <= 1 && !didNotPlay;
  // const fixture = player.nextFixture;

  return (
    <button
      type="button"
      className={styles.player}
      data-bench={isBench}
      data-dnp={didNotPlay}
      data-high={isHighScorer}
      onClick={() => onPlayerClick(player.element)}
      onMouseEnter={() => onHover(player.element)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={styles.playerCard}>
        <div className={styles.shirtContainer}>
          <Image
            src={shirtUrl}
            alt={player.teamName}
            width={40}
            height={40}
            className={styles.shirt}
            unoptimized
          />
          {player.isCaptain && (
            <span className={styles.captainBadge}>C</span>
          )}
          {player.isViceCaptain && (
            <span className={styles.vcBadge}>V</span>
          )}
        </div>
        <div className={styles.playerDetails}>
          <span className={styles.playerName}>{player.name}</span>
          <span className={styles.playerPoints}>
            {didNotPlay ? '-' : displayPoints}
          </span>
        </div>
      </div>
    </button>
  );
};
