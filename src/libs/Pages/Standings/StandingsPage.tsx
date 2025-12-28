import { cookies } from "next/headers";
import { Suspense } from "react";
import { buildLiveTable } from "../../Fpl/Services/FPLEngine";
import { StandingsList } from "./StandingsList";
import styles from "./StandingsList.module.css";

type PageProps = {
	params: Promise<{ id: string }>;
};

export const StandingsPage = (props: PageProps) => {
	return (
		<Suspense fallback={<StandingsAsyncSkeleton />}>
			<StandingsAsyncInner {...props} />
		</Suspense>
	);
};

const StandingsAsyncSkeleton = () => (
	<div className={styles.list}>
		<div className={styles.tableHeader}>
			<div className={styles.tableHeaderCell}>Pos</div>
			<div className={styles.tableHeaderCell}>Team</div>
			<div className={styles.tableHeaderCell}>GW Pts</div>
			<div className={styles.tableHeaderCell}>Total</div>
		</div>
		{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
			<div key={i} className={styles.skeletonRow}>
				<div className={styles.skeletonRank} />
				<div className={styles.skeletonInfo} />
				<div className={styles.skeletonPoints} />
				<div className={styles.skeletonTotal} />
			</div>
		))}
	</div>
);

const StandingsAsyncInner = async (props: PageProps) => {
	// Parallel fetch: Params, Cookies, and Cached Scores
	// This avoids waterfalls and keeps the component as a true "Async Leaf"
	const [params, cookieStore] = await Promise.all([props.params, cookies()]);

	const leagueId = Number(params.id);
	const scores = await buildLiveTable(leagueId);

	const savedLeagueId = cookieStore.get("fpl_league_id")?.value;
	const savedManagerId = cookieStore.get("fpl_manager_id")?.value;

	const selectedId =
		savedLeagueId === params.id
			? savedManagerId
				? Number(savedManagerId)
				: null
			: null;

	return (
		<StandingsList
			leagueId={leagueId}
			scores={scores}
			selectedId={selectedId}
		/>
	);
};
