'use client';

import { useState } from 'react';
import type { PlayerStatSummary } from '../../../../Fpl/Types';
import styles from './PlayerComparisonTable.module.css';

type SortField = 'totalPoints' | 'medianPoints' | 'averagePoints' | 'cost' | 'lastGwPoints' | 'webName' | 'matchesPlayed' | 'trimean';
type SortDirection = 'asc' | 'desc';

type Props = {
  players: PlayerStatSummary[];
};

export const PlayerComparisonTable = ({ players }: Props) => {
  const [sortField, setSortField] = useState<SortField>('medianPoints');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterPos, setFilterPos] = useState<string>('ALL');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...players]
    .filter(p => filterPos === 'ALL' || p.position === filterPos)
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      // Numbers
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className={styles.sortIcon}>↕</span>;
    return <span className={styles.sortIcon}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.filters}>
          <button 
            type="button"
            className={`${styles.filterBtn} ${filterPos === 'ALL' ? styles.active : ''}`}
            onClick={() => setFilterPos('ALL')}
          >
            All
          </button>
          <button 
            type="button"
            className={`${styles.filterBtn} ${filterPos === 'GKP' ? styles.active : ''}`}
            onClick={() => setFilterPos('GKP')}
          >
            GKP
          </button>
          <button 
            type="button"
            className={`${styles.filterBtn} ${filterPos === 'DEF' ? styles.active : ''}`}
            onClick={() => setFilterPos('DEF')}
          >
            DEF
          </button>
          <button 
            type="button"
            className={`${styles.filterBtn} ${filterPos === 'MID' ? styles.active : ''}`}
            onClick={() => setFilterPos('MID')}
          >
            MID
          </button>
          <button 
            type="button"
            className={`${styles.filterBtn} ${filterPos === 'FWD' ? styles.active : ''}`}
            onClick={() => setFilterPos('FWD')}
          >
            FWD
          </button>
        </div>
        <div className={styles.count}>
          Showing {sortedPlayers.length} players
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('webName')}>Player {getSortIcon('webName')}</th>
              <th>Team</th>
              <th>Pos</th>
              <th onClick={() => handleSort('cost')} className={styles.rightAlign}>Price {getSortIcon('cost')}</th>
              <th onClick={() => handleSort('matchesPlayed')} className={styles.rightAlign}>MP {getSortIcon('matchesPlayed')}</th>
              <th onClick={() => handleSort('totalPoints')} className={styles.rightAlign}>Total {getSortIcon('totalPoints')}</th>
              <th onClick={() => handleSort('averagePoints')} className={styles.rightAlign}>Avg {getSortIcon('averagePoints')}</th>
              <th onClick={() => handleSort('medianPoints')} className={styles.rightAlign}>Median {getSortIcon('medianPoints')}</th>
              <th onClick={() => handleSort('trimean')} className={styles.rightAlign}>Trimean {getSortIcon('trimean')}</th>
              <th onClick={() => handleSort('lastGwPoints')} className={styles.rightAlign}>Last GW {getSortIcon('lastGwPoints')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(player => (
              <tr key={player.id}>
                <td className={styles.playerName}>{player.webName}</td>
                <td className={styles.teamName}>{player.teamShortName}</td>
                <td className={styles.position}>{player.position}</td>
                <td className={styles.rightAlign}>£{player.cost.toFixed(1)}</td>
                <td className={styles.rightAlign}>{player.matchesPlayed}</td>
                <td className={styles.rightAlign}>{player.totalPoints}</td>
                <td className={styles.rightAlign}>{player.averagePoints.toFixed(1)}</td>
                <td className={`${styles.rightAlign} ${styles.highlight}`}>{player.medianPoints.toFixed(1)}</td>
                <td className={styles.rightAlign}>{player.trimean.toFixed(2)}</td>
                <td className={styles.rightAlign}>{player.lastGwPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
