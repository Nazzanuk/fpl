import { Suspense } from "react";
import { getBootstrapTeams } from "../../../../../libs/Fpl/Data/Client/BootstrapClient";
import { TeamDetailAsync } from "../../../../../libs/Pages/TeamDetail/Components/TeamDetailAsync";
import { Breadcrumbs } from "../../../../../libs/Shared/Components/Breadcrumbs/Breadcrumbs";

type PageProps = {
	params: Promise<{ id: string; teamId: string }>;
};

export default function TeamPage(props: PageProps) {
	return (
		<Suspense fallback={<TeamPageSkeleton />}>
			<TeamPageInner {...props} />
		</Suspense>
	);
}

const TeamPageSkeleton = () => (
	<div style={{ padding: "1rem" }}>
		<div>Loading...</div>
	</div>
);

const TeamPageInner = async (props: PageProps) => {
	const { id, teamId } = await props.params;
	const tId = parseInt(teamId, 10);

	const teams = await getBootstrapTeams();
	const teamInfo = teams.find((t: any) => t.id === tId);
	const teamName = teamInfo?.name || "Team";

	return (
		<div style={{ padding: "1rem" }}>
			<Breadcrumbs
				items={[
					{ label: "League", href: `/league/${id}` },
					{ label: teamName },
				]}
			/>
			<TeamDetailAsync leagueId={parseInt(id, 10)} teamId={tId} />
		</div>
	);
};
