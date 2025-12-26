import { Suspense } from 'react';
import { Sidebar } from '@/libs/Shared/Components/Sidebar/Sidebar';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const SidebarAsync = (props: PageProps) => {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarAsyncInner {...props} />
    </Suspense>
  );
};

const SidebarSkeleton = () => (
  <div style={{ width: '250px', background: 'var(--surface)', borderRight: '1px solid var(--border)' }} />
);

const SidebarAsyncInner = async ({ params }: PageProps) => {
  const { id } = await params;
  const leagueId = parseInt(id, 10);

  return <Sidebar leagueId={leagueId} />;
};
