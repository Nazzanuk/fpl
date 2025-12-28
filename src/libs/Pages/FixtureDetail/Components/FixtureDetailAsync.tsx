import { Suspense } from "react";
import { getFixtureDetail } from "../../../Fpl/Services/FPLEngine";
import { FixtureDetailInner } from "./FixtureDetailInner";

// import { FixtureDetailSkeleton } from './FixtureDetailSkeleton';

type Props = {
	leagueId: number;
	fixtureId: number;
};

export const FixtureDetailAsync = (props: Props) => {
	return (
		<Suspense fallback={<FixtureDetailAsyncSkeleton />}>
			<FixtureDetailAsyncInner {...props} />
		</Suspense>
	);
};

const FixtureDetailAsyncSkeleton = () => <div>Loading details...</div>;

const FixtureDetailAsyncInner = async ({ leagueId, fixtureId }: Props) => {
	const detail = await getFixtureDetail(fixtureId);

	if (!detail) {
		return <div>Fixture not found</div>;
	}

	return <FixtureDetailInner detail={detail} leagueId={leagueId} />;
};
