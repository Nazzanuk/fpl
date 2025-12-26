import { Suspense } from 'react';
import { Sidebar } from '@/libs/Shared/Components/Sidebar/Sidebar';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string; view?: string }>;
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

const SidebarAsyncInner = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { manager, view } = await searchParams;
  const leagueId = parseInt(id, 10);
  const selectedManagerId = manager ? parseInt(manager, 10) : undefined;
  
  return (
    <Sidebar
      leagueId={leagueId}
      currentView={view || 'standings'}
      selectedManagerId={selectedManagerId}
    />
  );
};
