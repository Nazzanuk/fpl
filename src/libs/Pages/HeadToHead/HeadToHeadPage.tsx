import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getGameweekStatus } from '../../Fpl/Utils/GameweekStatus';
import { buildLiveTable } from '../../Fpl/Services/FPLEngine';
import { HeadToHeadClient } from './Components/HeadToHeadClient';
import styles from './HeadToHeadPage.module.css';

type Props = {
	params: Promise<{ id: string }>;
};

export const HeadToHeadPage = (props: Props) => {
	return (
		<Suspense fallback={<HeadToHeadPageSkeleton />}>
			<HeadToHeadPageInner {...props} />
		</Suspense>
	);
};

const HeadToHeadPageSkeleton = () => (
	<div className={styles.container}>
		<div className={styles.selectors}>
			<div className={styles.skeletonSelect} />
			<span className={styles.vs}>vs</span>
			<div className={styles.skeletonSelect} />
		</div>
		<div className={styles.skeletonComparison} />
	</div>
);

const HeadToHeadPageInner = async ({ params }: Props) => {
	'use cache';
	const { id } = await params;
	const leagueId = parseInt(id, 10);

	cacheTag('head-to-head', `league-${leagueId}`);

	const { isLive } = await getGameweekStatus();
	cacheLife(isLive ? 'live' : 'gameweek' as any);

	const scores = await buildLiveTable(leagueId);
	return <HeadToHeadClient leagueId={leagueId} scores={scores} />;
};
