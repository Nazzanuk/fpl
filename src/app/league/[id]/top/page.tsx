import { TopManagersPage } from '../../../../libs/Pages/TopManagers/TopManagersPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page(props: Props) {
  return <TopManagersPage {...props} />;
}
