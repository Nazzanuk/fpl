'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LiveManagerScore } from '../../../../Fpl/Types';
import { StandingsList } from './StandingsList';
import { MatchTicker } from './MatchTicker';
import { QuickActionsClient } from './QuickActionsClient';
import { HeadToHead } from './HeadToHead';
import styles from './Dashboard.module.css';

type Fixture = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'finished' | 'upcoming';
  minutes: number;
  kickoff: string;
};

type Props = {
  leagueId: number;
  leagueName: string;
  scores: LiveManagerScore[];
  currentGw: number;
  fixtures: Fixture[];
  selectedManagerId?: number;
  view: string;
  children: ReactNode;
};

export const DashboardClient = ({
  leagueId,
  leagueName,
  scores,
  currentGw,
  fixtures,
  selectedManagerId,
  view,
  children,
}: Props) => {
  const router = useRouter();

  const handleSelectManager = (managerId: number) => {
    const params = new URLSearchParams();
    params.set('manager', String(managerId));
    if (view && view !== 'standings') params.set('view', view);
    router.push(`/league/${leagueId}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          FPL<span className={styles.brandAccent}>Live</span>
        </div>
        <div className={styles.leagueInfo}>
          <h1 className={styles.leagueName}>{leagueName}</h1>
          <div className={styles.gwBadge}>Gameweek {currentGw}</div>
        </div>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          Live
        </div>
      </header>

      <MatchTicker fixtures={fixtures} />

      <QuickActionsClient
        leagueId={leagueId}
        currentView={view}
        selectedManagerId={selectedManagerId}
      />

      <div className={styles.main}>
        <section className={styles.standings}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Standings</h2>
            <span className={styles.managerCount}>{scores.length} Teams</span>
          </div>
          <StandingsList
            scores={scores}
            selectedId={selectedManagerId || null}
            onSelect={handleSelectManager}
          />
        </section>

        <section className={styles.detail}>
          {view === 'h2h' ? (
            <HeadToHead scores={scores} onSelectManager={handleSelectManager} />
          ) : (
            children
          )}
        </section>
      </div>
    </>
  );
};
