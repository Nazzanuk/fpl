"use client";

import { Breadcrumbs } from "../../../Shared/Components/Breadcrumbs/Breadcrumbs";
import { EntityLink } from "../../../Shared/Components/EntityLink/EntityLink";
import styles from "./FixtureDetail.module.css";

type StatItem = {
	value: number;
	element: { id: number; web_name: string; team: number } | undefined;
};

type StatGroup = {
	identifier: string;
	home: StatItem[];
	away: StatItem[];
};

type TeamInfo = {
	id: number | undefined;
	name: string | undefined;
	shortName: string | undefined;
	code: number | undefined;
	score: number | null;
};

type FixtureDetail = {
	id: number;
	event: number | null;
	kickoff_time: string;
	finished: boolean;
	started: boolean;
	minutes: number;
	homeTeam: TeamInfo;
	awayTeam: TeamInfo;
	stats: StatGroup[];
};

type Props = {
	detail: FixtureDetail;
	leagueId: number;
};

export const FixtureDetailInner = ({ detail, leagueId }: Props) => {
	const formatStatLabel = (identifier: string) => {
		switch (identifier) {
			case "goals_scored":
				return "Goals";
			case "assists":
				return "Assists";
			case "own_goals":
				return "Own Goals";
			case "penalties_saved":
				return "Penalties Saved";
			case "penalties_missed":
				return "Penalties Missed";
			case "yellow_cards":
				return "Yellow Cards";
			case "red_cards":
				return "Red Cards";
			case "saves":
				return "Saves";
			case "bonus":
				return "Bonus";
			case "bps":
				return "BPS";
			default:
				return identifier;
		}
	};

	const relevantStats = detail.stats.filter(
		(s) => s.home.length > 0 || s.away.length > 0,
	);

	return (
		<div className={styles.container}>
			<Breadcrumbs
				items={[
					{ label: "League", href: `/league/${leagueId}` },
					{ label: "Fixtures", href: `/league/${leagueId}/matches` },
					{
						label: `GW${detail.event}: ${detail.homeTeam.shortName || detail.homeTeam.name} v ${detail.awayTeam.shortName || detail.awayTeam.name}`,
					},
				]}
			/>
			{/* Score Header */}
			<div className={styles.header}>
				<div className={styles.team}>
					{detail.homeTeam.id && detail.homeTeam.name ? (
						<EntityLink
							type="team"
							id={detail.homeTeam.id}
							label={detail.homeTeam.name}
							variant="card"
							contextLeagueId={leagueId}
							className={styles.teamLink}
						/>
					) : (
						<div>{detail.homeTeam.name || "Unknown"}</div>
					)}
					<div className={styles.score}>{detail.homeTeam.score ?? 0}</div>
				</div>

				<div className={styles.meta}>
					<div className={styles.gameweek}>GW {detail.event}</div>
					<div className={styles.time}>
						{detail.finished
							? "FT"
							: detail.started
								? `${detail.minutes}'`
								: new Date(detail.kickoff_time).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
					</div>
				</div>

				<div className={styles.team}>
					<div className={styles.score}>{detail.awayTeam.score ?? 0}</div>
					{detail.awayTeam.id && detail.awayTeam.name ? (
						<EntityLink
							type="team"
							id={detail.awayTeam.id}
							label={detail.awayTeam.name}
							variant="card"
							contextLeagueId={leagueId}
							className={styles.teamLink}
						/>
					) : (
						<div>{detail.awayTeam.name || "Unknown"}</div>
					)}
				</div>
			</div>

			{/* Stats Grid */}
			<div className={styles.stats}>
				{relevantStats.map((stat) => (
					<div key={stat.identifier} className={styles.statRow}>
						<div className={styles.statHome}>
							{stat.home.map((item, i) => (
								<div key={i} className={styles.playerStat}>
									{item.element && (
										<EntityLink
											type="player"
											id={item.element.id}
											label={`${item.element.web_name} (${item.value})`}
											variant="inline"
										/>
									)}
								</div>
							))}
						</div>

						<div className={styles.statLabel}>
							{formatStatLabel(stat.identifier)}
						</div>

						<div className={styles.statAway}>
							{stat.away.map((item, i) => (
								<div key={i} className={styles.playerStat}>
									{item.element && (
										<EntityLink
											type="player"
											id={item.element.id}
											label={`${item.element.web_name} (${item.value})`}
											variant="inline"
										/>
									)}
								</div>
							))}
						</div>
					</div>
				))}
				{relevantStats.length === 0 && (
					<div className={styles.empty}>No stats available</div>
				)}
			</div>
		</div>
	);
};
