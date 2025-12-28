import { SidebarAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/SidebarAsync';
import { DashboardHeader } from '@/libs/Pages/LeagueOverview/Components/Dashboard/DashboardHeader';
import { MatchTickerAsync } from '@/libs/Pages/LeagueOverview/Components/Dashboard/MatchTickerAsync';
import styles from '@/libs/Pages/LeagueOverview/Components/Dashboard/Dashboard.module.css';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default function Layout({ children, params }: LayoutProps) {
  return (
    <div className={styles.appContainer}>
      <SidebarAsync />

      <div className={styles.container}>
        <DashboardHeader params={params} />

        <MatchTickerAsync params={params} />

        <div className={styles.main}>
          {children}
        </div>
      </div>
    </div>
  );
}
