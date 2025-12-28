import { OwnershipPage } from '@/libs/Pages/Ownership/OwnershipPage';

type Props = {
	params: Promise<{ id: string }>;
};

export default function OwnershipRoute(props: Props) {
	return <OwnershipPage {...props} />;
}
