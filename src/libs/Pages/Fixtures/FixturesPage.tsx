import { Suspense } from 'react';
import Link from 'next/link';
import { getFixtures } from '../../Fpl/Data/Client/FPLApiClient';
import { getBootstrapEvents, getBootstrapTeams } from '../../Fpl/Data/Client/BootstrapClient';
import styles from './FixturesPage.module.css';

type Props = {
	params: Promise<{ id: string }>;
};

export const FixturesPage = (props: Props) => {
	return (
		<Suspense fallback={<FixturesPageSkeleton />}>
			<FixturesPageInner {...props} />
		</Suspense>
	);
};

const FixturesPageSkeleton = () => {
	return <div className={styles.skeleton}>Loading fixtures...</div>;
};

const FixturesPageInner = async ({ params }: Props) => {
	const { id } = await params;
	const leagueId = parseInt(id, 10);

	const [events, teams] = await Promise.all([
		getBootstrapEvents(),
		getBootstrapTeams(),
	]);
	const currentEvent = events.find((e: any) => e.is_current);
	const currentGw = currentEvent ? currentEvent.id : 38;

	const fixtures = await getFixtures(currentGw);

	// Helper to get team name
	const getTeamName = (id: number) => {
		const team = teams.find((t: any) => t.id === id);
		return team ? team.name : `Team ${id}`;
	};

	// Group by day
	const groupedFixtures = fixtures.reduce((acc: any, fixture: any) => {
		const date = new Date(fixture.kickoff_time).toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
		});
		if (!acc[date]) acc[date] = [];
		acc[date].push(fixture);
		return acc;
	}, {} as Record<string, typeof fixtures>);

	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Gameweek {currentGw} Fixtures</h2>
			{Object.entries(groupedFixtures).map(([date, dayFixtures]) => (
				<div key={date} className={styles.daySection}>
					<h3 className={styles.dateHeader}>{date.toUpperCase()}</h3>
					<div className={styles.fixturesList}>
						{(dayFixtures as any[]).map((fixture: any) => (
							<Link
								key={fixture.id}
								href={`/league/${leagueId}/fixture/${fixture.id}`}
								className={styles.fixtureRow}
							>
								<div className={`${styles.team} ${styles.homeTeam}`}>
									{getTeamName(fixture.team_h)}
								</div>
								<div className={styles.score}>
									{fixture.finished || fixture.team_h_score !== null ? (
										<>
											<span className={(fixture.team_h_score ?? 0) > (fixture.team_a_score ?? 0) ? styles.winner : ''}>
												{fixture.team_h_score}
											</span>
											<span className={styles.separator}>-</span>
											<span className={(fixture.team_a_score ?? 0) > (fixture.team_h_score ?? 0) ? styles.winner : ''}>
												{fixture.team_a_score}
											</span>
										</>
									) : (
										<span className={styles.time}>
											{new Date(fixture.kickoff_time).toLocaleTimeString('en-GB', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
									)}
								</div>
								<div className={`${styles.team} ${styles.awayTeam}`}>
									{getTeamName(fixture.team_a)}
								</div>
							</Link>
						))}
					</div>
				</div>
			))}
		</div>
	);
};
