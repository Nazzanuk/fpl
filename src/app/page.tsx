import { navigateToLeague } from '../libs/Fpl/Actions/NavigationActions';
import styles from './page.module.css';

export default function Home() {

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            FPL<span className={styles.brandAccent}>Live</span>
          </div>
          <div className={styles.headerBadge}>Season 2024/25</div>
        </header>

        <div className={styles.hero}>
          <h1 className={styles.title}>
            Track your mini-league
            <span className={styles.highlight}>in real time</span>
          </h1>
          <p className={styles.subtitle}>
            Live scores, projected bonus points, auto-subs, and captain performance.
            See exactly who&apos;s winning your league right now.
          </p>

          <form action={navigateToLeague} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="number"
                name="leagueId"
                placeholder="Enter your league ID"
                className={styles.input}
                required
              />
              <button type="submit" className={styles.button}>
                Track
              </button>
            </div>
            <p className={styles.hint}>
              Find your league ID in the URL when viewing your league on the FPL website
            </p>
          </form>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>01</div>
            <h3 className={styles.featureTitle}>Live Standings</h3>
            <p className={styles.featureDesc}>
              Real-time league table with live gameweek scores and position changes
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>02</div>
            <h3 className={styles.featureTitle}>Head to Head</h3>
            <p className={styles.featureDesc}>
              Compare any two managers side by side with detailed breakdowns
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>03</div>
            <h3 className={styles.featureTitle}>Differentials</h3>
            <p className={styles.featureDesc}>
              Discover which players give you an edge over your rivals
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>04</div>
            <h3 className={styles.featureTitle}>Ownership</h3>
            <p className={styles.featureDesc}>
              See exactly who owns what across your entire league
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
