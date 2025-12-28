import { TrendsPage } from '@/libs/Pages/Trends/TrendsPage';

type Props = {
	params: Promise<{ id: string }>;
};

export default function TrendsRoute(props: Props) {
	return <TrendsPage {...props} />;
}
