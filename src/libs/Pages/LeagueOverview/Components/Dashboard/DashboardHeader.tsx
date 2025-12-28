import { Suspense } from "react";
import { getBootstrapEvents } from "../../../../Fpl/Data/Client/BootstrapClient";
import { getLeagueData } from "../../../../Fpl/Data/Client/FPLApiClient";
import type { LeagueStandings } from "../../../../Fpl/Types";
import styles from "./Dashboard.module.css";
import { ManagerSelector } from "./ManagerSelector";

type PageProps = {
	params: Promise<{ id: string }>;
};

/**
 * DashboardHeader with self-contained Suspense boundary.
 * Accepts PageProps directly and handles param extraction + data fetching internally.
 */
export const DashboardHeader = (props: PageProps) => {
	return (
		<Suspense fallback={<DashboardHeaderSkeleton />}>
			<DashboardHeaderInner {...props} />
		</Suspense>
	);
};

const DashboardHeaderSkeleton = () => (
	<header className={styles.header}>
		<div className={styles.leagueInfo}>
			<div
				style={{
					height: "20px",
					width: "180px",
					background: "var(--ink-light)",
					borderRadius: "4px",
				}}
			/>
			<div className={styles.gwBadge} style={{ opacity: 0.5 }}>
				Gameweek --
			</div>
		</div>
		<div className={styles.liveIndicator}>
			<span className={styles.liveDot} />
			Live
		</div>
	</header>
);

const DashboardHeaderInner = async ({ params }: PageProps) => {
	const { id } = await params;
	const leagueId = parseInt(id, 10);

	const [events, leagueData] = await Promise.all([
		getBootstrapEvents(),
		getLeagueData(leagueId) as Promise<LeagueStandings>,
	]);

	const currentEvent = events.find((e) => e.is_current);
	const currentGw = currentEvent?.id || 38;

	return (
		<header className={styles.header}>
			<div className={styles.leagueInfo}>
				<h1 className={styles.leagueName}>{leagueData.league.name}</h1>
				<div className={styles.gwBadge}>Gameweek {currentGw}</div>

				<ManagerSelector
					leagueId={leagueId}
					managers={leagueData.standings.results.map((m: any) => ({
						id: m.entry,
						name: m.player_name,
						teamName: m.entry_name,
					}))}
				/>
			</div>
			<div className={styles.liveIndicator}>
				<span className={styles.liveDot} />
				Live
			</div>
		</header>
	);
};
