
import { Suspense } from 'react';
import { BestXIAsync } from '../Tools/Components/BestXI/BestXIAsync';
import styles from './DreamTeamPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const DreamTeamPage = (props: Props) => {
  return (
    <Suspense fallback={<DreamTeamPageSkeleton />}>
      <DreamTeamPageInner {...props} />
    </Suspense>
  );
};

const DreamTeamPageSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.skeleton} />
    </div>
  );
};

const DreamTeamPageInner = async ({ params }: Props) => {
  const { id } = await params;
  const leagueId = Number.parseInt(id, 10);

  return <BestXIAsync leagueId={leagueId} mode="dream" />;
};
