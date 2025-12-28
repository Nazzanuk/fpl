"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { LiveManagerScore } from "../../Fpl/Types";
import styles from "./StandingsList.module.css";

type Props = {
	scores: LiveManagerScore[];
	leagueId: number;
	selectedId?: number | null; // Optional highlighting
};

export const StandingsList = ({ scores, leagueId, selectedId }: Props) => {
	const listRef = useRef<HTMLDivElement>(null);
	const [sortConfig, setSortConfig] = useState<{
		key: keyof LiveManagerScore | "rank" | "teamTrimean";
		direction: "asc" | "desc";
	}>({ key: "rank", direction: "asc" });

	const handleSort = (key: keyof LiveManagerScore | "rank" | "teamTrimean") => {
		setSortConfig((current) => ({
			key,
			direction:
				current.key === key && current.direction === "desc" ? "asc" : "desc",
		}));
	};

	const sortedScores = [...scores].sort((a, b) => {
		const { key, direction } = sortConfig;
		let aValue: any = a[key as keyof LiveManagerScore];
		let bValue: any = b[key as keyof LiveManagerScore];

		// Handle special cases
		if (key === "rank") {
			aValue = a.liveRank || 999;
			bValue = b.liveRank || 999;
		}

		if (aValue < bValue) return direction === "asc" ? -1 : 1;
		if (aValue > bValue) return direction === "asc" ? 1 : -1;
		return 0;
	});

	const SortIcon = ({ column }: { column: string }) => {
		if (sortConfig.key !== column)
			return (
				<span
					className="material-symbols-sharp"
					style={{ fontSize: "10px", opacity: 0.3, marginLeft: "4px" }}
				>
					unfold_more
				</span>
			);
		return (
			<span
				className="material-symbols-sharp"
				style={{ fontSize: "10px", color: "var(--gold)", marginLeft: "4px" }}
			>
				{sortConfig.direction === "asc" ? "expand_less" : "expand_more"}
			</span>
		);
	};

	return (
		<div className={styles.list} ref={listRef}>
			<div className={styles.tableHeader}>
				<div
					className={styles.tableHeaderCell}
					onClick={() => handleSort("rank")}
					style={{ cursor: "pointer" }}
				>
					Pos <SortIcon column="rank" />
				</div>
				<div
					className={styles.tableHeaderCell}
					onClick={() => handleSort("managerName")}
					style={{ cursor: "pointer" }}
				>
					Team <SortIcon column="managerName" />
				</div>
				<div
					className={`${styles.tableHeaderCell} ${styles.alignRight}`}
					onClick={() => handleSort("teamTrimean")}
					style={{ cursor: "pointer" }}
				>
					Secret Sauce <SortIcon column="teamTrimean" />
				</div>
				<div
					className={`${styles.tableHeaderCell} ${styles.alignRight}`}
					onClick={() => handleSort("liveGWPoints")}
					style={{ cursor: "pointer" }}
				>
					GW Pts <SortIcon column="liveGWPoints" />
				</div>
				<div
					className={`${styles.tableHeaderCell} ${styles.alignRight}`}
					onClick={() => handleSort("liveTotalPoints")}
					style={{ cursor: "pointer" }}
				>
					Total <SortIcon column="liveTotalPoints" />
				</div>
			</div>
			{sortedScores.map((score, index) => {
				const rank = score.liveRank || index + 1; // Use persistent rank if available
				const isSelected = score.managerId === selectedId;
				const rankChange = score.rankChange || 0;

				return (
					<Link
						key={score.managerId}
						href={`/league/${leagueId}/manager/${score.managerId}`}
						className={`${styles.row} ${isSelected ? styles.selected : ""}`}
					>
						<div className={styles.rank}>
							<span className={styles.rankNum}>{rank}</span>
							{rankChange !== 0 && (
								<span
									className={`${styles.movement} ${rankChange > 0 ? styles.up : styles.down}`}
								>
									<span
										className="material-symbols-sharp"
										style={{ fontSize: "12px" }}
									>
										{rankChange > 0 ? "stat_1" : "stat_minus_1"}
									</span>
								</span>
							)}
						</div>

						<div className={styles.info}>
							<div className={styles.managerName}>
								{score.managerName}
								{score.activeChip && (
									<span className={styles.chip}>
										{formatChip(score.activeChip)}
									</span>
								)}
							</div>
							<div className={styles.playerName}>{score.playerName}</div>
						</div>

						<div className={`${styles.points} ${styles.ssColumn}`}>
							<div className={styles.gwPoints}>
								{score.teamTrimean?.toFixed(1) || "-"}
							</div>
							<div className={styles.gwLabel}>SS</div>
						</div>

						<div className={styles.points}>
							<div className={styles.gwPoints}>
								{score.liveGWPoints}
								{score.transferCost != null && score.transferCost > 0 && (
									<span className={styles.transferCost}>
										-{score.transferCost}pts
									</span>
								)}
							</div>
							<div className={styles.gwLabel}>Points</div>
						</div>

						<div className={styles.total}>
							<div className={styles.totalPoints}>{score.liveTotalPoints}</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

const formatChip = (chip: string): string => {
	const chipMap: Record<string, string> = {
		bboost: "BB",
		"3xc": "TC",
		wildcard: "WC",
		freehit: "FH",
	};
	return chipMap[chip] || chip.toUpperCase();
};
