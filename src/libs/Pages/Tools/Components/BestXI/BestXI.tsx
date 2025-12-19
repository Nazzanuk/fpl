
'use client';

import { useState } from 'react';
import type { BestXI, RecommendedTransfer } from '../../../../Fpl/Services/RecommendationEngine';
import type { PlayerStatSummary } from '../../../../Fpl/Types';
import styles from './BestXI.module.css';

type Props = {
  bestXI: BestXI;
  recommendations: RecommendedTransfer[];
  managerTeam?: BestXI | null;
};

export const BestXIView = ({ bestXI, recommendations, managerTeam }: Props) => {
  const [viewMode, setViewMode] = useState<'dream' | 'manager'>('dream');

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

  // Helper to get FDR color class based on difficulty
  const getFDRClass = (fdr: number): string => {
    if (fdr <= 2) return styles.fdrEasy;
    if (fdr <= 3) return styles.fdrMedium;
    if (fdr <= 4) return styles.fdrHard;
    return styles.fdrVeryHard;
  };

  const { gkp, def, mid, fwd } = getPitchRows(currentTeam.starting11);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
           {managerTeam && (
             <div className={styles.toggleContainer}>
               <button 
                 className={`${styles.toggleBtn} ${viewMode === 'dream' ? styles.active : ''}`}
                 onClick={() => setViewMode('dream')}
               >
                 Dream Team
               </button>
               <button 
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
             <div className={styles.statLabel}>Total Trimean</div>
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
          <h3 className={styles.sectionTitle}>Transfer Recommendations</h3>
          {recommendations.length === 0 ? (
            <div className={styles.empty}>No clear upgrades found within budget.</div>
          ) : (
            <div className={styles.recList}>
              {recommendations.map((rec, i) => (
                <div key={i} className={styles.recCard}>
                  <div className={styles.recHeader}>
                    <div className={styles.recRank}>#{i + 1}</div>
                    <div className={styles.recStats}>
                      <span className={styles.gain}>+{rec.trimeanDiff.toFixed(2)} Trimean</span>
                      <span className={rec.costDiff <= 0 ? styles.positiveCost : styles.negativeCost}>
                        {rec.costDiff <= 0 ? `saves £${Math.abs(rec.costDiff).toFixed(1)}m` : `costs £${rec.costDiff.toFixed(1)}m`}
                      </span>
                    </div>
                  </div>
                  <div className={styles.recBody}>
                    <div className={styles.playerOut}>
                      <span className={styles.label}>OUT</span>
                      <span className={styles.name}>{rec.playerOut.webName}</span>
                      <div className={styles.playerMeta}>
                        <span className={styles.trimeanValue}>{rec.playerOut.trimean.toFixed(2)}</span>
                        <span className={styles.fdrLabel}>FDR: <span className={getFDRClass(rec.playerOutFDR)}>{rec.playerOutFDR.toFixed(1)}</span></span>
                      </div>
                    </div>
                    <div className={styles.arrow}>→</div>
                    <div className={styles.playerIn}>
                      <span className={styles.label}>IN</span>
                      <span className={styles.name}>{rec.playerIn.webName}</span>
                      <div className={styles.playerMeta}>
                        <span className={styles.trimeanValue}>{rec.playerIn.trimean.toFixed(2)}</span>
                        <span className={styles.fdrLabel}>FDR: <span className={getFDRClass(rec.playerInFDR)}>{rec.playerInFDR.toFixed(1)}</span></span>
                      </div>
                    </div>
                  </div>
                  {rec.fixtureDifficultyImpact !== 0 && (
                    <div className={styles.recFixtures}>
                      <span className={rec.fixtureDifficultyImpact > 0 ? styles.fixtureGood : styles.fixtureBad}>
                        Fixtures: {rec.fixtureDifficultyImpact > 0 ? 'Easier' : 'Harder'} ({Math.abs(rec.fixtureDifficultyImpact).toFixed(1)})
                      </span>
                    </div>
                  )}
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
      <span className={styles.playerName}>{player.webName}</span>
      <span className={styles.playerPoints}>
        {player.gwPoints != null ? player.gwPoints : player.trimean.toFixed(2)}
        {player.gwPoints != null && <span className={styles.trimeanSub}> ({player.trimean.toFixed(1)})</span>}
      </span>
    </div>
  </div>
);
