
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { BestXIAsync } from '../Tools/Components/BestXI/BestXIAsync';
import styles from './MyTeamPage.module.css';

type Props = {
  params: Promise<{ id: string }>;
};

export const MyTeamPage = (props: Props) => {
  return (
    <Suspense fallback={<MyTeamPageSkeleton />}>
      <MyTeamPageInner {...props} />
    </Suspense>
  );
};

const MyTeamPageSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.skeleton} />
    </div>
  );
};

const MyTeamPageInner = async ({ params }: Props) => {
  const { id } = await params;
  const leagueId = Number.parseInt(id, 10);

  const cookieStore = await cookies();
  const managerIdFromCookie =
    cookieStore.get('currentlySelectedManagerId')?.value ||
    cookieStore.get('fpl_manager_id')?.value;

  if (!managerIdFromCookie) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            Please select a manager from the dropdown
          </p>
        </div>
      </div>
    );
  }

  const managerId = Number.parseInt(managerIdFromCookie, 10);

  return <BestXIAsync leagueId={leagueId} managerId={managerId} mode="manager" />;
};
