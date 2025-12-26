import styles from '@/libs/Pages/LeagueOverview/Components/Dashboard/Dashboard.module.css';

export default function DetailDefault() {
  return (
    <div className={styles.emptyState}>
      <span className="material-symbols-sharp" style={{ fontSize: 48, opacity: 0.3 }}>
        person_search
      </span>
      <p>Select a manager to view details</p>
    </div>
  );
}
