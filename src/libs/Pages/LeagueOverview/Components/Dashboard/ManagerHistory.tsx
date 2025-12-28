"use client";

import styles from "./ManagerHistory.module.css";

type GameweekHistory = {
	readonly event: number;
	readonly points: number;
	readonly total_points: number;
	readonly rank: number;
	readonly overall_rank: number;
	readonly bank: number;
	readonly value: number;
	readonly event_transfers: number;
	readonly event_transfers_cost: number;
	readonly points_on_bench: number;
};

type Props = {
	history: readonly GameweekHistory[];
};

export const ManagerHistory = ({ history }: Props) => {
	if (!history || history.length === 0) return null;

	// Show only reversed history (newest first)
	const reversedHistory = [...history].reverse();

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Season History</h3>
			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>GW</th>
							<th className={styles.alignRight}>Pts</th>
							<th className={styles.alignRight}>Total</th>
							<th className={styles.alignRight}>Rank</th>
							<th className={styles.alignRight}>Overall</th>
						</tr>
					</thead>
					<tbody>
						{reversedHistory.map((gw) => (
							<tr key={gw.event} className={styles.row}>
								<td>{gw.event}</td>
								<td className={styles.alignRight}>{gw.points}</td>
								<td className={styles.alignRight}>{gw.total_points}</td>
								<td className={styles.alignRight}>
									{gw.rank?.toLocaleString() || "-"}
								</td>
								<td className={styles.alignRight}>
									{gw.overall_rank?.toLocaleString() || "-"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
