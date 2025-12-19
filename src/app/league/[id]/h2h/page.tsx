
import { StandingsAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/StandingsAsync';
import { DetailPanelAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DetailPanelAsync';
import styles from '@/Components/Layout/PageLayout.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string }>;
};

export default function HeadToHeadPage(props: PageProps) {

  return (
    <div className={styles.container}>
      <section className={styles.leftPanel}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Live Standings</h2>
        </div>
        <StandingsAsync {...props} viewOverride="h2h" />
      </section>

      <section className={styles.rightPanel}>
         <div className={styles.sectionHeader}>
             <h2 className={styles.sectionTitle}>Head to Head Comparison</h2>
         </div>
         <DetailPanelAsync {...props} viewOverride="h2h" />
      </section>
    </div>
  );
}
