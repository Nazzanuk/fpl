import { Suspense } from "react";
import { getBootstrapTeams } from "../../../../../libs/Fpl/Data/Client/BootstrapClient";
import { getAllFixtures } from "../../../../../libs/Fpl/Data/Client/FPLApiClient";
import { FixtureDetailAsync } from "../../../../../libs/Pages/FixtureDetail/Components/FixtureDetailAsync";
import { Breadcrumbs } from "../../../../../libs/Shared/Components/Breadcrumbs/Breadcrumbs";

type Props = {
	params: Promise<{
		id: string; // leagueId
		fixtureId: string;
	}>;
};

export default function FixturePage(props: Props) {
	return (
		<Suspense fallback={<FixturePageSkeleton />}>
			<FixturePageInner {...props} />
		</Suspense>
	);
}

const FixturePageSkeleton = () => (
	<div style={{ padding: "1rem" }}>
		<div style={{ marginBottom: "1rem" }}>Loading...</div>
	</div>
);

const FixturePageInner = async (props: Props) => {
	const { id, fixtureId } = await props.params;
	const leagueId = parseInt(id, 10);
	const fId = parseInt(fixtureId, 10);

	// Quick fetch for breadcrumb label
	const [teams, fixtures] = await Promise.all([
		getBootstrapTeams(),
		getAllFixtures(),
	]);

	const fixture = fixtures.find((f: any) => f.id === fId);
	let fixtureLabel = "Fixture";

	if (fixture) {
		const homeTeam = teams.find((t: any) => t.id === fixture.team_h);
		const awayTeam = teams.find((t: any) => t.id === fixture.team_a);
		fixtureLabel = `${homeTeam?.short_name || "Home"} vs ${awayTeam?.short_name || "Away"}`;
	}

	return (
		<div style={{ padding: "1rem" }}>
			<Breadcrumbs
				items={[
					{ label: "League", href: `/league/${id}` },
					{ label: fixtureLabel },
				]}
			/>
			<FixtureDetailAsync leagueId={leagueId} fixtureId={fId} />
		</div>
	);
};
