import styles from "@/libs/Pages/LeagueOverview/Components/Dashboard/Dashboard.module.css";
import { LeagueSummaryAsync } from "@/libs/Pages/LeagueOverview/Components/Dashboard/LeagueSummaryAsync";
import { StandingsPage } from "@/libs/Pages/Standings/StandingsPage";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default function LeaguePage({ params }: PageProps) {
	return (
		<div className={styles.dashboardGrid}>
			<section className={styles.standings}>
				<div className={styles.sectionHeader}>
					<h2 className={styles.sectionTitle}>Standings</h2>
				</div>
				<StandingsPage params={params} />
			</section>

			<section className={styles.detail}>
				<LeagueSummaryAsync params={params} />
			</section>
		</div>
	);
}
