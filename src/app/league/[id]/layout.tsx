import { SidebarAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/SidebarAsync';
import { DashboardHeader } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DashboardHeader';
import { MatchTickerAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/MatchTickerAsync';
import styles from '@/libs/Pages/LeagueOverview/Components/Dashboard/Dashboard.module.css';

type LayoutProps = {
  children: React.ReactNode;
  standings: React.ReactNode;
  detail: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default function Layout({ standings, detail, modal, params }: LayoutProps) {
  return (
    <div className={styles.appContainer}>
      <SidebarAsync params={params} />

      <div className={styles.container}>
        <DashboardHeader params={params} />

        <MatchTickerAsync />

        <div className={styles.main}>
          <section className={styles.standings}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Standings</h2>
            </div>
            {standings}
          </section>

          <section className={styles.detail}>
            {detail}
          </section>
        </div>
      </div>

      {modal}
    </div>
  );
}
