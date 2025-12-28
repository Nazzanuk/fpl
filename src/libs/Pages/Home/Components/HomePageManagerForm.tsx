import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getLeagueData } from "../../../Fpl/Data/Client/FPLApiClient";
import type { LeagueStandingsResponse } from "../../../Fpl/Types/LeagueStandingsResponse";
import styles from "../Home.page.module.css";

export const HomePageManagerForm = (props: any) => (
	<Suspense>
		<HomePageManagerFormInner {...props} />
	</Suspense>
);

const submitAction = async (formData: FormData) => {
	"use server";

	const managerId = formData.get("managerId") as string;
	const activeLeagueId = formData.get("leagueId") as string;

	const cookieStore = await cookies();
	cookieStore.set("fpl_manager_id", managerId);
	redirect(`/league/${activeLeagueId}`);
};

const clearSavedLeague = async () => {
	"use server";

	const cookieStore = await cookies();
	cookieStore.delete("fpl_league_id");
	cookieStore.delete("fpl_manager_id");
	refresh();
};

const HomePageManagerFormInner = async (props: any) => {
	const cookieStore = await cookies();
	const savedLeagueId = cookieStore.get("fpl_league_id")?.value;
	const savedManagerId = cookieStore.get("fpl_manager_id")?.value;

	let leagueData: LeagueStandingsResponse | undefined;

	if (!savedLeagueId || savedManagerId) return null;

	if (savedLeagueId) {
		try {
			leagueData = await getLeagueData(parseInt(savedLeagueId));
		} catch (e) {
			return null;
		}
	}

	return (
		<form action={submitAction} className={styles.form}>
			<input type="hidden" name="leagueId" value={savedLeagueId} />
			<div className={styles.selectionHeader}>
				<span className={styles.leagueNameLabel}>
					League: {leagueData?.league.name}
				</span>
				<div className={styles.changeLink} onClick={clearSavedLeague}>
					Change
				</div>
			</div>
			<div className={styles.inputGroup}>
				<select
					name="managerId"
					className={styles.input}
					required
					defaultValue=""
				>
					<option value="" disabled>
						Select your team...
					</option>
					{leagueData?.standings.results.map((m) => (
						<option key={m.entry} value={m.entry}>
							{m.entry_name} ({m.player_name})
						</option>
					))}
				</select>
				<button type="submit" className={styles.button}>
					Track
				</button>
			</div>
			<p className={styles.hint}>
				Select your team to personalize your experience
			</p>
		</form>
	);
};
