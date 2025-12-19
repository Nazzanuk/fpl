import { StandingsAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/StandingsAsync';
import { DetailPanelAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DetailPanelAsync';
import styles from '@/Components/Layout/PageLayout.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string }>;
};

export default function DifferentialsPage(props: PageProps) {
  return (
    <div className={styles.container}>
      <section className={styles.leftPanel}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Live Standings</h2>
        </div>
        <StandingsAsync {...props} viewOverride="differentials" />
      </section>

      <section className={styles.rightPanel}>
         <div className={styles.sectionHeader}>
             <h2 className={styles.sectionTitle}>Differential Gems</h2>
         </div>
         <DetailPanelAsync {...props} viewOverride="differentials" />
      </section>
    </div>
  );
}
