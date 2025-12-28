import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getLeagueTrends } from '../../Fpl/Services/AnalyticsEngine';
import { LeagueTrendsContent } from './Components/TrendsContent';
import styles from './TrendsPage.module.css';

type Props = {
	params: Promise<{ id: string }>;
};

export const TrendsPage = (props: Props) => {
	return (
		<Suspense fallback={<TrendsPageSkeleton />}>
			<TrendsPageInner {...props} />
		</Suspense>
	);
};

const TrendsPageSkeleton = () => {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.skeletonTitle} />
				<div className={styles.skeletonSubtitle} />
			</div>
			<div className={styles.skeletonChart} />
			<div className={styles.skeletonLegend} />
		</div>
	);
};

const TrendsPageInner = async ({ params }: Props) => {
	'use cache';
	const { id } = await params;
	const leagueId = parseInt(id, 10);

	cacheTag('league-trends', `league-${leagueId}`);
	cacheLife('gameweek' as any);

	const trends = await getLeagueTrends(leagueId);

	return <LeagueTrendsContent trends={trends} />;
};
