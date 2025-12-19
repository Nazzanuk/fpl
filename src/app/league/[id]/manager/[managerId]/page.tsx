import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string; managerId: string }>;
};

export default async function ManagerPage({ params }: PageProps) {
  const { id, managerId } = await params;
  redirect(`/league/${id}?manager=${managerId}`);
}
