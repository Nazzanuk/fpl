import { FDRPage } from '@/libs/Pages/FDR/FDRPage';

type Props = {
	params: Promise<{ id: string }>;
};

export default function FDRRoute(props: Props) {
	return <FDRPage {...props} />;
}
