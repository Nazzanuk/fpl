'use client';

import styles from '../HistoryPage.module.css';

type Chip = {
  name: string;
  event: number;
};

type Props = {
  chips: Chip[];
};

const CHIP_CONFIG: Record<string, { label: string; abbr: string; description: string }> = {
  wildcard: { label: 'Wildcard', abbr: 'WC', description: 'Unlimited free transfers' },
  bboost: { label: 'Bench Boost', abbr: 'BB', description: 'Bench points count' },
  '3xc': { label: 'Triple Captain', abbr: '3C', description: 'Captain points tripled' },
  freehit: { label: 'Free Hit', abbr: 'FH', description: 'One-week squad change' },
};

const ALL_CHIPS = ['wildcard', 'bboost', '3xc', 'freehit'];

export const ChipsUsed = ({ chips }: Props) => {
  const usedChips = new Map(chips.map(c => [c.name, c.event]));
  const usedCount = usedChips.size;

  return (
    <div className={styles.chipsSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Chips Status</span>
        <span className={styles.chipsCount}>
          {usedCount}/{ALL_CHIPS.length} Used
        </span>
      </div>

      <div className={styles.chipsGrid}>
        {ALL_CHIPS.map(chipName => {
          const config = CHIP_CONFIG[chipName];
          const usedGw = usedChips.get(chipName);
          const isUsed = usedGw !== undefined;

          return (
            <div key={chipName} className={styles.chipCard} data-used={isUsed}>
              <div className={styles.chipHeader}>
                <span className={styles.chipBadge} data-used={isUsed}>
                  {config.abbr}
                </span>
                <span className={styles.chipStatus}>
                  {isUsed ? (
                    <span className={styles.chipUsedBadge}>GW {usedGw}</span>
                  ) : (
                    <span className={styles.chipAvailableBadge}>AVAILABLE</span>
                  )}
                </span>
              </div>
              <div className={styles.chipInfo}>
                <span className={styles.chipName}>{config.label}</span>
                <span className={styles.chipDesc}>{config.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
