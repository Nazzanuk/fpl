import { FixturesPage } from '@/libs/Pages/Fixtures/FixturesPage';

type Props = {
	params: Promise<{ id: string }>;
};

export default function FixturesRoute(props: Props) {
	return <FixturesPage {...props} />;
}
