import styles from './LiveTicker.module.css';

// Mock data for now - will be replaced by real live stream later
const MOCK_EVENTS = [
  { id: 1, minute: "12'", player: "Haaland (MCI)", event: "GOAL", type: "goal" },
  { id: 2, minute: "12'", player: "Foden (MCI)", event: "ASSIST", type: "assist" },
  { id: 3, minute: "24'", player: "Saka (ARS)", event: "GOAL", type: "goal" },
  { id: 4, minute: "31'", player: "Salah (LIV)", event: "GOAL", type: "goal" },
  { id: 5, minute: "45+2'", player: "Palmer (CHE)", event: "YELLOW", type: "card" },
  { id: 6, minute: "56'", player: "Watkins (AVL)", event: "GOAL", type: "goal" },
  { id: 7, minute: "67'", player: "Son (TOT)", event: "GOAL", type: "goal" },
];

export const LiveTicker = () => {
  return (
    <div className={styles.tickerWrapper}>
      <div className={styles.tickerContent}>
        {MOCK_EVENTS.map((item) => (
          <div key={item.id} className={styles.tickerItem}>
            <span className={styles.time}>{item.minute}</span>
            <span className={styles.player}>{item.player}</span>
            <span className={styles.event}>{item.event}</span>
          </div>
        ))}
         {/* Duplicate for seamless loop if needed, but animation handles restart usually. 
             Ideally better ticker impl duplicates content or uses js. 
             For CSS only, we need enough content to fill screen + overflow. */}
        {MOCK_EVENTS.map((item) => (
          <div key={`dup-${item.id}`} className={styles.tickerItem}>
            <span className={styles.time}>{item.minute}</span>
            <span className={styles.player}>{item.player}</span>
            <span className={styles.event}>{item.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
