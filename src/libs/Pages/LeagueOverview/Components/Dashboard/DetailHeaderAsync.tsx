import { Suspense } from 'react';
import styles from './Dashboard.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ manager?: string; view?: string }>;
};

const HeaderInner = async ({ searchParams }: PageProps) => {
  const { manager } = await searchParams;
  const hasManager = !!manager;
  
  return (
    <h2 className={styles.sectionTitle}>
      {hasManager ? 'Manager Detail' : 'League Overview'}
    </h2>
  );
};

export const DetailHeaderAsync = (props: PageProps) => {
  return (
    <Suspense fallback={<h2 className={styles.sectionTitle}>...</h2>}>
      <HeaderInner {...props} />
    </Suspense>
  );
};
