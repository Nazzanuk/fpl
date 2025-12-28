'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { PlayerStatSummary } from '../../../Fpl/Types';
import { EntityLink } from '../../../Shared/Components/EntityLink/EntityLink';
import styles from './PlayerComparisonTable.module.css';

type SortField = 'totalPoints' | 'medianPoints' | 'averagePoints' | 'cost' | 'lastGwPoints' | 'webName' | 'matchesPlayed' | 'trimean';
type SortDirection = 'asc' | 'desc';

type Props = {
  players: PlayerStatSummary[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

export const PlayerComparisonTable = ({ players, totalCount, currentPage, pageSize }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sortField, setSortField] = useState<SortField>('totalPoints');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterPos, setFilterPos] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesPos = filterPos === 'ALL' || p.position === filterPos;
    const matchesSearch = searchQuery === '' ||
      p.webName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  const sortedPlayers = [...filteredPlayers]
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const res = valA.localeCompare(valB);
        return sortDirection === 'asc' ? res : -res;
      }

      const numA = Number(valA);
      const numB = Number(valB);
      if (numA < numB) return sortDirection === 'asc' ? -1 : 1;
      if (numA > numB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className={styles.sortIcon}>↕</span>;
    return <span className={styles.sortIcon}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <div className={styles.filters}>
            {['ALL', 'GKP', 'DEF', 'MID', 'FWD'].map(pos => (
              <button
                key={pos}
                type="button"
                className={`${styles.filterBtn} ${filterPos === pos ? styles.active : ''}`}
                onClick={() => setFilterPos(pos)}
              >
                {pos === 'ALL' ? 'All' : pos}
              </button>
            ))}
          </div>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search page..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.count}>
          Page {currentPage} of {totalPages} ({totalCount} players)
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
              <th onClick={() => handleSort('trimean')} className={styles.rightAlign}>Secret Sauce {getSortIcon('trimean')}</th>
              <th onClick={() => handleSort('lastGwPoints')} className={styles.rightAlign}>Last GW {getSortIcon('lastGwPoints')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(player => (
              <tr key={player.id} className={player.status !== 'a' ? styles.unavailable : ''}>
                <td className={styles.playerName}>
                  <EntityLink
                    type="player"
                    id={player.id}
                    label={player.webName}
                  />
                  {player.injuryStatus && <span className={styles.newsBadge} title={player.injuryStatus}>!</span>}
                </td>
                <td className={styles.teamName}>
                  <EntityLink
                    type="team"
                    id={player.teamId}
                    label={player.teamShortName}
                    variant="inline"
                  />
                </td>
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

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageBtn}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <div className={styles.pageNumbers}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

            return (
              <button
                key={pageNum}
                type="button"
                className={`${styles.pageNum} ${currentPage === pageNum ? styles.activePage : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={styles.pageBtn}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
