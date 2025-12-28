import { DreamTeamPage } from '../../../../libs/Pages/DreamTeam/DreamTeamPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page(props: Props) {
  return <DreamTeamPage {...props} />;
}
