import { StandingsPage } from "../../../../libs/Pages/Standings/StandingsPage";

export default (props: { params: Promise<{ id: string }> }) => {
	return <StandingsPage {...props} />;
};
