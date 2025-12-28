import { MyTeamPage } from '../../../../libs/Pages/MyTeam/MyTeamPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page(props: Props) {
  return <MyTeamPage {...props} />;
}
