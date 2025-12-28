import { HeadToHeadPage } from '@/libs/Pages/HeadToHead/HeadToHeadPage';

type Props = {
	params: Promise<{ id: string }>;
};

export default function H2HRoute(props: Props) {
	return <HeadToHeadPage {...props} />;
}
