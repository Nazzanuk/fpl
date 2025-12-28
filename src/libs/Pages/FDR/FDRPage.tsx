import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { getFDRData } from '../../Fpl/Services/AnalyticsEngine';
import { FDRPlannerContent } from '../../Pages/Tools/Components/FDRPlanner/FDRPlannerContent';
import styles from './FDRPage.module.css';

type Props = {
	params: Promise<{ id: string }>;
};

export const FDRPage = (_props: Props) => {
	return (
		<Suspense fallback={<FDRPageSkeleton />}>
			<FDRPageInner />
		</Suspense>
	);
};

const FDRPageSkeleton = () => {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.skeletonTitle} />
				<div className={styles.skeletonSubtitle} />
			</div>
			<div className={styles.skeletonLegend} />
			<div className={styles.skeletonGrid} />
		</div>
	);
};

const FDRPageInner = async () => {
	'use cache'
	cacheTag('fdr-planner');
	cacheLife('static' as any);

	const fdrData = await getFDRData(6);

	return <FDRPlannerContent teams={fdrData} />;
};
