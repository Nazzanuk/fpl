'use client';

import { useMemo } from 'react';
import styles from '../HistoryPage.module.css';

type GameweekData = {
  event: number;
  points: number;
  totalPoints: number;
  rank: number;
  overallRank: number;
};

type Props = {
  gameweeks: GameweekData[];
};

export const HistoryChart = ({ gameweeks }: Props) => {
  const stats = useMemo(() => {
    if (gameweeks.length === 0) return null;
    const points = gameweeks.map(gw => gw.points);
    const maxPoints = Math.max(...points, 1);
    const minPoints = Math.min(...points, 0);
    const avgPoints = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
    const bestGw = gameweeks.reduce((best, gw) => gw.points > best.points ? gw : best);
    const worstGw = gameweeks.reduce((worst, gw) => gw.points < worst.points ? gw : worst);
    return { maxPoints, minPoints, avgPoints, bestGw, worstGw };
  }, [gameweeks]);

  const yAxisLabels = useMemo(() => {
    if (!stats) return [0, 20, 40, 60, 80, 100];
    const step = stats.maxPoints <= 50 ? 10 : stats.maxPoints <= 100 ? 20 : 25;
    const labels: number[] = [];
    for (let v = 0; v <= stats.maxPoints + step; v += step) {
      labels.push(v);
    }
    return labels;
  }, [stats]);

  if (!stats) return null;

  const chartMax = yAxisLabels[yAxisLabels.length - 1];

  return (
    <div className={styles.chartSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Points by Gameweek</span>
        <div className={styles.chartStats}>
          <span className={styles.chartStat}>
            <span className={styles.chartStatLabel}>Best</span>
            <span className={styles.chartStatValue} data-variant="positive">{stats.bestGw.points}</span>
          </span>
          <span className={styles.chartStat}>
            <span className={styles.chartStatLabel}>Avg</span>
            <span className={styles.chartStatValue}>{stats.avgPoints}</span>
          </span>
          <span className={styles.chartStat}>
            <span className={styles.chartStatLabel}>Worst</span>
            <span className={styles.chartStatValue} data-variant="negative">{stats.worstGw.points}</span>
          </span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <div className={styles.yAxis}>
          {yAxisLabels.map(value => (
            <span
              key={value}
              className={styles.yLabel}
              style={{ bottom: `${(value / chartMax) * 100}%` }}
            >
              {value}
            </span>
          ))}
        </div>

        <div className={styles.chart}>
          <div className={styles.gridLines}>
            {yAxisLabels.map(value => (
              <div
                key={value}
                className={styles.gridLine}
                style={{ bottom: `${(value / chartMax) * 100}%` }}
              />
            ))}
          </div>

          <div
            className={styles.avgLineMarker}
            style={{ bottom: `${(stats.avgPoints / chartMax) * 100}%` }}
          >
            <span className={styles.avgLabel}>AVG</span>
          </div>

          <div className={styles.chartBars}>
            {gameweeks.map(gw => {
              const height = (gw.points / chartMax) * 100;
              const isAboveAvg = gw.points >= stats.avgPoints;
              const isBest = gw.event === stats.bestGw.event;
              const isWorst = gw.event === stats.worstGw.event;

              return (
                <div key={gw.event} className={styles.barContainer}>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{ height: `${height}%` }}
                      data-above-avg={isAboveAvg}
                      data-best={isBest}
                      data-worst={isWorst}
                    >
                      <span className={styles.barValue}>{gw.points}</span>
                    </div>
                  </div>
                  <span className={styles.barLabel}>{gw.event}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.chartLegend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} data-type="above" />
          <span className={styles.legendText}>Above Avg</span>
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} data-type="below" />
          <span className={styles.legendText}>Below Avg</span>
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendLine} />
          <span className={styles.legendText}>Average ({stats.avgPoints})</span>
        </span>
      </div>
    </div>
  );
};
