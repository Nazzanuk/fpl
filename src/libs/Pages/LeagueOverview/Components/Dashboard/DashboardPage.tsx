import { Suspense } from 'react';
import { SidebarAsync } from './SidebarAsync';
import { DashboardHeaderAsync } from './DashboardHeaderAsync';
import { MatchTickerAsync } from './MatchTickerAsync';
import { StandingsAsync } from './StandingsAsync';
import { DetailPanelAsync } from './DetailPanelAsync';
import { MatchTickerSkeleton } from './Skeletons/MatchTickerSkeleton';

import styles from './Dashboard.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string; view?: string }>;
};

export const DashboardPage = (props: PageProps) => {
  return (
    <div className={styles.appContainer}>
      <Suspense fallback={<div className={styles.sidebarSkeleton} />}>
        <SidebarAsync {...props} />
      </Suspense>
      
      <div className={styles.container}>
        <Suspense fallback={<div className={styles.headerSkeleton} />}>
          <DashboardHeaderAsync {...props} />
        </Suspense>
        
        <Suspense fallback={<MatchTickerSkeleton />}>
          <MatchTickerAsync />
        </Suspense>
        
        <div className={styles.main}>
          <section className={styles.standings}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Standings</h2>
            </div>
            <StandingsAsync {...props} />
          </section>
          
          <section className={styles.detail}>
            <DetailPanelAsync {...props} />
          </section>
        </div>
      </div>
    </div>
  );
};
