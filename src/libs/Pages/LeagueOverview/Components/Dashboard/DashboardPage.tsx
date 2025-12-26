import { SidebarAsync } from './SidebarAsync';
import { DashboardHeader } from './DashboardHeader';
import { MatchTickerAsync } from './MatchTickerAsync';
import { StandingsAsync } from './StandingsAsync';
import { DetailPanelAsync } from './DetailPanelAsync';

import styles from './Dashboard.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string; view?: string }>;
};

export const DashboardPage = (props: PageProps) => {
  return (
    <div className={styles.appContainer}>
        <SidebarAsync {...props} />
      
      <div className={styles.container}>
          <DashboardHeader params={props.params} />
        
        <MatchTickerAsync />
        
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
