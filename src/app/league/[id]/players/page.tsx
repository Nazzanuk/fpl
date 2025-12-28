import { PlayersPage } from '../../../../libs/Pages/Players/PlayersPage';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export default function Page(props: Props) {
  return <PlayersPage {...props} />;
}
