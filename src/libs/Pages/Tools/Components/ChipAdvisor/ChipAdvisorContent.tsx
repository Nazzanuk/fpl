'use client';

import type { ChipRecommendation } from '../../../../Fpl/Services/AnalyticsEngine';
import styles from './ChipAdvisor.module.css';

type Props = {
  recommendations: ChipRecommendation[];
  usedChips: Set<string>;
  chipsHistory: Array<{ name: string; event: number }>;
};

const CHIP_ICONS: Record<string, string> = {
  bboost: 'BB',
  '3xc': '3×',
  freehit: 'FH',
  wildcard: 'WC',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

export const ChipAdvisorContent = ({ recommendations, usedChips, chipsHistory }: Props) => {
  const availableChips = recommendations.filter(r => !usedChips.has(r.chip));
  const usedChipsList = chipsHistory;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Chip Strategy</h2>
        <span className={styles.subtitle}>Based on Your Squad</span>
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Recommendations</span>
            <span className={styles.chipCount}>{availableChips.length} available</span>
          </div>

          {availableChips.length === 0 ? (
            <div className={styles.emptyState}>All chips have been used this season</div>
          ) : (
            <div className={styles.chipCards}>
              {availableChips.map(rec => (
                <div key={rec.chip} className={styles.chipCard}>
                  <div className={styles.chipHeader}>
                    <span className={styles.chipIcon}>{CHIP_ICONS[rec.chip]}</span>
                    <div className={styles.chipInfo}>
                      <span className={styles.chipName}>{rec.chipLabel}</span>
                      <span className={styles.recommendedGw}>
                        Recommended: GW{rec.recommendedGw}
                      </span>
                    </div>
                    <div className={styles.scoreWrapper}>
                      <span className={styles.score}>{rec.score}</span>
                      <span className={styles.scoreLabel}>Score</span>
                    </div>
                  </div>

                  <p className={styles.reason}>{rec.reason}</p>

                  {rec.managerPlayers && rec.managerPlayers.length > 0 && (
                    <div className={styles.playerSection}>
                      <span className={styles.playerSectionLabel}>
                        {rec.chip === 'bboost' && 'Your bench players:'}
                        {rec.chip === '3xc' && 'Captain options:'}
                        {rec.chip === 'freehit' && 'Players with hard fixtures:'}
                      </span>
                      <div className={styles.playerList}>
                        {rec.managerPlayers.map((p, idx) => (
                          <div
                            key={idx}
                            className={styles.playerChip}
                            data-difficulty={p.difficulty}
                          >
                            <span className={styles.playerName}>
                              {p.name}
                              {p.isCaptain && <span className={styles.captainBadge}>C</span>}
                            </span>
                            <span className={styles.playerFixture}>
                              {p.fixture}
                            </span>
                            <span
                              className={styles.difficultyBadge}
                              data-difficulty={p.difficulty}
                            >
                              {DIFFICULTY_LABELS[p.difficulty] || 'Medium'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.fixtures.length > 0 && !rec.managerPlayers?.length && (
                    <div className={styles.fixtures}>
                      <span className={styles.fixturesLabel}>Key fixtures:</span>
                      <div className={styles.fixturesList}>
                        {rec.fixtures.map((f, idx) => (
                          <span
                            key={idx}
                            className={styles.fixture}
                            data-difficulty={f.difficulty}
                          >
                            {f.team} vs {f.opponent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {usedChipsList.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Used Chips</span>
            </div>

            <div className={styles.usedChips}>
              {usedChipsList.map((chip, idx) => (
                <div key={idx} className={styles.usedChip}>
                  <span className={styles.usedChipIcon}>{CHIP_ICONS[chip.name]}</span>
                  <span className={styles.usedChipName}>
                    {chip.name === 'bboost' && 'Bench Boost'}
                    {chip.name === '3xc' && 'Triple Captain'}
                    {chip.name === 'freehit' && 'Free Hit'}
                    {chip.name === 'wildcard' && 'Wildcard'}
                  </span>
                  <span className={styles.usedChipGw}>GW{chip.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
