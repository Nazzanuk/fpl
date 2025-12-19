
import { StandingsAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/StandingsAsync';
import { DetailPanelAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DetailPanelAsync';
import { DetailHeaderAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DetailHeaderAsync';
import styles from '@/Components/Layout/PageLayout.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string }>;
};

export default function StandingsPage(props: PageProps) {

  return (
    <div className={styles.container}>
      <section className={styles.leftPanel}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Live Standings</h2>
        </div>
        <StandingsAsync {...props} viewOverride="standings" />
      </section>

      <section className={styles.rightPanel}>
         {/* DetailPanel handles its own headers/content based on logic */}
         <div className={styles.sectionHeader}>
             <DetailHeaderAsync {...props} />
         </div>
         <DetailPanelAsync {...props} viewOverride="standings" />
      </section>
    </div>
  );
}
