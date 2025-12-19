'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiveManagerScore } from '../../../../Fpl/Types';
import styles from './HeadToHead.module.css';

type Props = {
  leagueId: number;
  scores: LiveManagerScore[];
};

export const HeadToHeadClient = ({ leagueId, scores }: Props) => {
  const router = useRouter();
  const [manager1, setManager1] = useState<number | null>(scores[0]?.managerId || null);
  const [manager2, setManager2] = useState<number | null>(scores[1]?.managerId || null);

  const m1 = scores.find(s => s.managerId === manager1);
  const m2 = scores.find(s => s.managerId === manager2);

  const m1Rank = scores.findIndex(s => s.managerId === manager1) + 1;
  const m2Rank = scores.findIndex(s => s.managerId === manager2) + 1;

  const handleSelectManager = (managerId: number) => {
    router.push(`/league/${leagueId}?manager=${managerId}`, { scroll: false });
  };

  return (
    <div className={styles.container}>
      <div className={styles.selectors}>
        <select
          className={styles.select}
          value={manager1 || ''}
          onChange={e => setManager1(Number(e.target.value))}
        >
          {scores.map(s => (
            <option key={s.managerId} value={s.managerId}>
              {s.managerName}
            </option>
          ))}
        </select>
        <span className={styles.vs}>vs</span>
        <select
          className={styles.select}
          value={manager2 || ''}
          onChange={e => setManager2(Number(e.target.value))}
        >
          {scores.map(s => (
            <option key={s.managerId} value={s.managerId}>
              {s.managerName}
            </option>
          ))}
        </select>
      </div>

      {m1 && m2 && (
        <div className={styles.comparison}>
          <div className={styles.side}>
            <button
              className={styles.managerCard}
              onClick={() => handleSelectManager(m1.managerId)}
            >
              <div className={styles.rank}>#{m1Rank}</div>
              <div className={styles.name}>{m1.managerName}</div>
              <div className={styles.player}>{m1.playerName}</div>
            </button>
            <div className={styles.points}>
              <div className={styles.gwPoints}>{m1.liveGWPoints}</div>
              <div className={styles.totalPoints}>{m1.liveTotalPoints}</div>
            </div>
          </div>

          <div className={styles.diff}>
            <div className={styles.diffValue}>
              {m1.liveGWPoints > m2.liveGWPoints ? '+' : ''}
              {m1.liveGWPoints - m2.liveGWPoints}
            </div>
            <div className={styles.diffLabel}>GW Diff</div>
            <div className={styles.diffValue}>
              {m1.liveTotalPoints > m2.liveTotalPoints ? '+' : ''}
              {m1.liveTotalPoints - m2.liveTotalPoints}
            </div>
            <div className={styles.diffLabel}>Total Diff</div>
          </div>

          <div className={styles.side}>
            <button
              className={styles.managerCard}
              onClick={() => handleSelectManager(m2.managerId)}
            >
              <div className={styles.rank}>#{m2Rank}</div>
              <div className={styles.name}>{m2.managerName}</div>
              <div className={styles.player}>{m2.playerName}</div>
            </button>
            <div className={styles.points}>
              <div className={styles.gwPoints}>{m2.liveGWPoints}</div>
              <div className={styles.totalPoints}>{m2.liveTotalPoints}</div>
            </div>
          </div>
        </div>
      )}

      {m1 && m2 && m1.captain && m2.captain && (
        <div className={styles.captainCompare}>
          <div className={styles.captainSide}>
            <span className={styles.captainBadge}>C</span>
            <span className={styles.captainName}>{m1.captain.name}</span>
            <span className={styles.captainPts}>{m1.captain.points}</span>
          </div>
          <div className={styles.captainLabel}>Captains</div>
          <div className={styles.captainSide}>
            <span className={styles.captainPts}>{m2.captain.points}</span>
            <span className={styles.captainName}>{m2.captain.name}</span>
            <span className={styles.captainBadge}>C</span>
          </div>
        </div>
      )}
    </div>
  );
};
