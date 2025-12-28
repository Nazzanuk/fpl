import { TransfersPage } from '../../../../libs/Pages/Transfers/TransfersPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page(props: Props) {
  return <TransfersPage {...props} />;
}
