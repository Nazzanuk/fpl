
'use client';

import { useState } from 'react';
import type { BestXI, RecommendedTransfer } from '../../../../Fpl/Services/RecommendationEngine';
import type { PlayerStatSummary } from '../../../../Fpl/Types';
import { EntityLink } from '../../../../Shared/Components/EntityLink/EntityLink';
import styles from './BestXI.module.css';

type Props = {
  bestXI: BestXI;
  recommendations: RecommendedTransfer[];
  managerTeam?: (BestXI & { activeChip?: string | null }) | null;
  defaultMode?: 'dream' | 'manager';
};

export const BestXIView = ({ bestXI, recommendations, managerTeam, defaultMode }: Props) => {
  const [viewMode, setViewMode] = useState<'dream' | 'manager'>(defaultMode || 'dream');

  // If no manager team, force dream view
  const currentTeam = (viewMode === 'manager' && managerTeam) ? managerTeam : bestXI;

  // Helper to get formatted position for pitch
  const getPitchRows = (players: PlayerStatSummary[]) => {
    const gkp = players.filter(p => p.position === 'GKP');
    const def = players.filter(p => p.position === 'DEF');
    const mid = players.filter(p => p.position === 'MID');
    const fwd = players.filter(p => p.position === 'FWD');
    return { gkp, def, mid, fwd };
  };



  const { gkp, def, mid, fwd } = getPitchRows(currentTeam.starting11);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
           {managerTeam && (
             <div className={styles.toggleContainer}>
               <button 
                 type="button"
                 className={`${styles.toggleBtn} ${viewMode === 'dream' ? styles.active : ''}`}
                 onClick={() => setViewMode('dream')}
               >
                 Dream Team
               </button>
               <button 
                 type="button"
                 className={`${styles.toggleBtn} ${viewMode === 'manager' ? styles.active : ''}`}
                 onClick={() => setViewMode('manager')}
               >
                 My Team
               </button>
             </div>
           )}
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statGroup}>
             <div className={styles.statLabel}>Total Secret Sauce</div>
             <div className={styles.statValue}>{currentTeam.totalTrimean.toFixed(2)}</div>
             {viewMode === 'manager' && (
               <div className={styles.statDiff}>
                 Max: {bestXI.totalTrimean.toFixed(2)} 
                 <span className={styles.negative}> ({-(bestXI.totalTrimean - currentTeam.totalTrimean).toFixed(2)})</span>
               </div>
             )}
          </div>
          
          <div className={styles.statGroup}>
             <div className={styles.statLabel}>Est. Cost</div>
             <div className={styles.statValue}>£{currentTeam.totalCost.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.pitchSection}>
          <div className={styles.pitchHeader}>
             <h3 className={styles.sectionTitle}>
                {viewMode === 'dream' ? 'Theoretical Best XI' : 'Your Starting XI'}
                {viewMode === 'manager' && managerTeam?.activeChip && (
                  <span className={styles.chipBadge}>{managerTeam.activeChip.toUpperCase()} ACTIVE</span>
                )}
             </h3>
          </div>
          <div className={styles.pitch}>
             {/* Goalkeeper */}
             <div className={styles.pitchRow}>
                {gkp.map(p => <PlayerNode key={p.id} player={p} isDiff={false} />)}
             </div>
             {/* Defenders */}
             <div className={styles.pitchRow}>
                {def.map(p => <PlayerNode key={p.id} player={p} isDiff={false} />)}
             </div>
             {/* Midfielders */}
             <div className={styles.pitchRow}>
                {mid.map(p => <PlayerNode key={p.id} player={p} isDiff={false} />)}
             </div>
             {/* Forwards */}
             <div className={styles.pitchRow}>
                {fwd.map(p => <PlayerNode key={p.id} player={p} isDiff={false} />)}
             </div>
          </div>
        </div>

        <div className={styles.recSection}>
          <div className={styles.recHeader}>
            <span className={styles.recHeaderTitle}>Recommended Transfers</span>
            <span className={styles.recHeaderCount}>{recommendations.length}</span>
          </div>
          {recommendations.length === 0 ? (
            <div className={styles.empty}>No clear upgrades found within budget.</div>
          ) : (
            <div className={styles.recTable}>
              <div className={styles.recTableHeader}>
                <span className={styles.colRank}>#</span>
                <span className={styles.colOut}>Out</span>
                <span className={styles.colArrow}></span>
                <span className={styles.colIn}>In</span>
                <span className={styles.colGain}>SS</span>
                <span className={styles.colCost}>Cost</span>
                <span className={styles.colFdr}>FDR</span>
              </div>
              {recommendations.map((rec, i) => (
                <div 
                  key={`${rec.playerOut.id}-${rec.playerIn.id}`} 
                  className={`${styles.recRow} ${rec.costDiff <= 0 ? styles.recRowValue : ''}`}
                >
                  <span className={styles.colRank}>{i + 1}</span>
                  <span className={styles.colOut}>
                    <EntityLink
                      type="player"
                      id={rec.playerOut.id}
                      label={rec.playerOut.webName}
                      className={styles.playerName}
                    />
                    <span className={styles.playerSS}>{rec.playerOut.trimean.toFixed(1)}</span>
                  </span>
                  <span className={styles.colArrow}>→</span>
                  <span className={styles.colIn}>
                    <EntityLink
                      type="player"
                      id={rec.playerIn.id}
                      label={rec.playerIn.webName}
                      className={styles.playerName}
                    />
                    <span className={styles.playerSS}>{rec.playerIn.trimean.toFixed(1)}</span>
                  </span>
                  <span className={`${styles.colGain} ${styles.positive}`}>
                    +{rec.trimeanDiff.toFixed(2)}
                  </span>
                  <span className={`${styles.colCost} ${rec.costDiff <= 0 ? styles.positive : styles.muted}`}>
                    {rec.costDiff <= 0 
                      ? (rec.costDiff === 0 ? 'FREE' : `+£${Math.abs(rec.costDiff).toFixed(1)}m`)
                      : `-£${rec.costDiff.toFixed(1)}m`}
                  </span>
                  <span className={`${styles.colFdr} ${rec.fixtureDifficultyImpact > 0 ? styles.fdrEasy : rec.fixtureDifficultyImpact < 0 ? styles.fdrHard : ''}`}>
                    {rec.fixtureDifficultyImpact > 0 ? '▼' : rec.fixtureDifficultyImpact < 0 ? '▲' : '–'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PlayerNode = ({ player, isDiff }: { player: PlayerStatSummary & { gwPoints?: number }; isDiff?: boolean }) => (
  <div className={`${styles.playerNode} ${isDiff ? styles.diffNode : ''}`}>
    <div className={styles.kit}>
       {/* Simple kit representation */}
       <div className={`${styles.shirt} ${styles['team-' + player.teamShortName]}`} />
    </div>
    <div className={styles.playerInfo}>
      <EntityLink
        type="player"
        id={player.id}
        label={player.webName}
        className={styles.playerName}
      />
      <span className={styles.playerPoints}>
        {player.gwPoints != null ? player.gwPoints : player.trimean.toFixed(2)}
        {player.gwPoints != null && <span className={styles.trimeanSub}> ({player.trimean.toFixed(1)})</span>}
      </span>
    </div>
  </div>
);
