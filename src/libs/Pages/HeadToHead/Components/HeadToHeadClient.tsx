'use client';

import { useState } from 'react';
import { LiveScore } from '../../../Fpl/Services/FPLEngine';
import { EntityLink } from '../../../Shared/Components/EntityLink/EntityLink';
import styles from '../HeadToHeadPage.module.css';

export const HeadToHeadClient = ({ leagueId, scores }: { leagueId: number; scores: LiveScore[] }) => {
	const [manager1, setManager1] = useState<number | null>(scores[0]?.managerId || null);
	const [manager2, setManager2] = useState<number | null>(scores[1]?.managerId || null);

	const m1 = scores.find(s => s.managerId === manager1);
	const m2 = scores.find(s => s.managerId === manager2);

	const m1Rank = scores.findIndex(s => s.managerId === manager1) + 1;
	const m2Rank = scores.findIndex(s => s.managerId === manager2) + 1;

	return (
		<div className={styles.container}>
			<div className={styles.selectors}>
				<select
					className={styles.select}
					value={manager1 || ''}
					onChange={e => setManager1(Number(e.target.value))}
				>
					{scores.map(s => (
						<option key={s.managerId} value={s.managerId}>
							{s.managerName}
						</option>
					))}
				</select>
				<span className={styles.vs}>vs</span>
				<select
					className={styles.select}
					value={manager2 || ''}
					onChange={e => setManager2(Number(e.target.value))}
				>
					{scores.map(s => (
						<option key={s.managerId} value={s.managerId}>
							{s.managerId} - {s.managerName}
						</option>
					))}
				</select>
			</div>

			{m1 && m2 && (
				<div className={styles.comparison}>
					<div className={styles.side}>
						<div className={styles.managerCard}>
							<div className={styles.rank}>#{m1Rank}</div>
							<EntityLink
								type="manager"
								id={m1.managerId}
								label={m1.managerName}
								className={styles.name}
							/>
							<div className={styles.player}>{m1.playerName}</div>
						</div>
						<div className={styles.points}>
							<div className={styles.gwPoints}>{m1.liveGWPoints}</div>
							<div className={styles.totalPoints}>{m1.liveTotalPoints}</div>
						</div>
					</div>

					<div className={styles.diff}>
						<div className={styles.diffValue}>
							{m1.liveGWPoints > m2.liveGWPoints ? '+' : ''}
							{m1.liveGWPoints - m2.liveGWPoints}
						</div>
						<div className={styles.diffLabel}>GW Diff</div>
						<div className={styles.diffValue}>
							{m1.liveTotalPoints > m2.liveTotalPoints ? '+' : ''}
							{m1.liveTotalPoints - m2.liveTotalPoints}
						</div>
						<div className={styles.diffLabel}>Total Diff</div>
					</div>

					<div className={styles.side}>
						<div className={styles.managerCard}>
							<div className={styles.rank}>#{m2Rank}</div>
							<EntityLink
								type="manager"
								id={m2.managerId}
								label={m2.managerName}
								className={styles.name}
							/>
							<div className={styles.player}>{m2.playerName}</div>
						</div>
						<div className={styles.points}>
							<div className={styles.gwPoints}>{m2.liveGWPoints}</div>
							<div className={styles.totalPoints}>{m2.liveTotalPoints}</div>
						</div>
					</div>
				</div>
			)}

			{m1 && m2 && m1.captain && m2.captain && (
				<div className={styles.captainCompare}>
					<div className={styles.captainSide}>
						<span className={styles.captainBadge}>C</span>
						<EntityLink
							type="player"
							id={m1.captain.id}
							label={m1.captain.name}
							className={styles.captainName}
						/>
						<span className={styles.captainPts}>{m1.captain.points}</span>
					</div>
					<div className={styles.captainLabel}>Captains</div>
					<div className={styles.captainSide}>
						<span className={styles.captainPts}>{m2.captain.points}</span>
						<EntityLink
							type="player"
							id={m2.captain.id}
							label={m2.captain.name}
							className={styles.captainName}
						/>
						<span className={styles.captainBadge}>C</span>
					</div>
				</div>
			)}
		</div>
	);
};
