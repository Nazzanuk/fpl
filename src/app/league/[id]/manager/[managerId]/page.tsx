import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string; managerId: string }>;
};

import { Suspense } from 'react';

async function ManagerPageContent({ params }: PageProps) {
  const { id, managerId } = await params;
  redirect(`/league/${id}?manager=${managerId}`);
  return null;
}

export default function ManagerPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <ManagerPageContent params={params} />
    </Suspense>
  );
}
