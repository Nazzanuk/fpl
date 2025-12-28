import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getLeagueData } from "../../../Fpl/Data/Client/FPLApiClient";
import type { LeagueStandingsResponse } from "../../../Fpl/Types";
import styles from "../Home.page.module.css";

export const HomePageLeagueForm = (props: any) => (
	<Suspense>
		<HomePageLeagueFormInner {...props} />
	</Suspense>
);

const handleSubmit = async (formData: FormData) => {
	"use server";

	const leagueId = formData.get("leagueId") as string;

	const cookieStore = await cookies();
	cookieStore.set("fpl_league_id", leagueId);
	cookieStore.delete("fpl_manager_id");
	refresh();
};

const HomePageLeagueFormInner = async (props: any) => {
	const cookieStore = await cookies();
	const savedLeagueId = cookieStore.get("fpl_league_id")?.value;
	const savedManagerId = cookieStore.get("fpl_manager_id")?.value;

	let error = "";
	let leagueData: LeagueStandingsResponse | undefined;

	if (savedLeagueId) {
		try {
			leagueData = await getLeagueData(parseInt(savedLeagueId));
		} catch (e) {
			error = "Could not find league. Please check the ID and try again.";
		}
	}

	if (leagueData && !savedManagerId) return null;

	return (
		<>
			<form action={handleSubmit} className={styles.form}>
				<div className={styles.inputGroup}>
					<input
						type="number"
						name="leagueId"
						placeholder="Enter your league ID"
						className={styles.input}
						required
					/>
					<button type="submit" className={styles.button}>
						Next
					</button>
				</div>
				{error && <p className={styles.error}>{error}</p>}
				<p className={styles.hint}>
					Find your league ID in the URL when viewing your league on the FPL
					website
				</p>
			</form>

			{leagueData && (
				<div className={styles.resumeSection}>
					<a href={`/league/${savedLeagueId}`} className={styles.resumeButton}>
						Resume {leagueData.league?.name}
					</a>
				</div>
			)}
		</>
	);
};
