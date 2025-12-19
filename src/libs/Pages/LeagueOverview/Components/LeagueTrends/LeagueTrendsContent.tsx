'use client';

import { useState, useMemo } from 'react';
import type { LeagueTrend } from '../../../../Fpl/Services/AnalyticsEngine';
import styles from './LeagueTrends.module.css';

type Props = {
  trends: LeagueTrend[];
};

type ChartType = 'rank' | 'total' | 'weekly';

const COLORS = [
  '#d4af37', '#0a0f1c', '#059669', '#dc2626', '#3b82f6',
  '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1',
];

export const LeagueTrendsContent = ({ trends }: Props) => {
  const [chartType, setChartType] = useState<ChartType>('rank');
  const [selectedManagers, setSelectedManagers] = useState<Set<number>>(
    new Set(trends.slice(0, 5).map(t => t.managerId))
  );

  const gameweeks = trends[0]?.history.map(h => h.event) || [];
  const maxGw = Math.max(...gameweeks, 1);

  const chartData = useMemo(() => {
    const selectedTrends = trends.filter(t => selectedManagers.has(t.managerId));

    if (chartType === 'rank') {
      return { maxValue: trends.length, minValue: 1, inverted: true };
    }

    if (chartType === 'weekly') {
      const allPoints = selectedTrends.flatMap(t => t.history.map(h => h.points));
      return {
        maxValue: Math.max(...allPoints, 1),
        minValue: Math.min(...allPoints, 0),
        inverted: false,
      };
    }

    const allPoints = selectedTrends.flatMap(t => t.history.map(h => h.totalPoints));
    return {
      maxValue: Math.max(...allPoints, 1),
      minValue: Math.min(...allPoints, 0),
      inverted: false,
    };
  }, [trends, selectedManagers, chartType]);

  const stats = useMemo(() => {
    const selectedTrends = trends.filter(t => selectedManagers.has(t.managerId));
    if (selectedTrends.length === 0) return null;

    const latestGw = gameweeks[gameweeks.length - 1];
    const leader = selectedTrends.reduce((best, t) => {
      const latest = t.history.find(h => h.event === latestGw);
      const bestLatest = best.history.find(h => h.event === latestGw);
      return (latest?.totalPoints || 0) > (bestLatest?.totalPoints || 0) ? t : best;
    });

    const leaderLatest = leader.history.find(h => h.event === latestGw);
    const avgWeeklyPoints = selectedTrends.reduce((sum, t) => {
      const avg = t.history.reduce((s, h) => s + h.points, 0) / t.history.length;
      return sum + avg;
    }, 0) / selectedTrends.length;

    return {
      leader: leader.managerName,
      leaderPoints: leaderLatest?.totalPoints || 0,
      avgWeekly: Math.round(avgWeeklyPoints),
      gameweeksPlayed: gameweeks.length,
    };
  }, [trends, selectedManagers, gameweeks]);

  const toggleManager = (managerId: number) => {
    setSelectedManagers(prev => {
      const next = new Set(prev);
      if (next.has(managerId)) {
        next.delete(managerId);
      } else {
        next.add(managerId);
      }
      return next;
    });
  };

  const getYValue = (trend: LeagueTrend, h: { event: number; rank: number; points: number; totalPoints: number }) => {
    const value = chartType === 'rank' ? h.rank : chartType === 'weekly' ? h.points : h.totalPoints;
    const range = chartData.maxValue - chartData.minValue || 1;
    if (chartData.inverted) {
      return ((value - chartData.minValue) / range) * 240 + 30;
    }
    return 270 - ((value - chartData.minValue) / range) * 240;
  };

  const yAxisLabels = useMemo(() => {
    const labels: { value: number; y: number }[] = [];
    const range = chartData.maxValue - chartData.minValue;
    const step = range <= 5 ? 1 : range <= 20 ? 5 : range <= 100 ? 20 : Math.ceil(range / 5);

    for (let v = chartData.minValue; v <= chartData.maxValue; v += step) {
      const y = chartData.inverted
        ? ((v - chartData.minValue) / (range || 1)) * 240 + 30
        : 270 - ((v - chartData.minValue) / (range || 1)) * 240;
      labels.push({ value: Math.round(v), y });
    }
    return labels;
  }, [chartData]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>League Trends</h2>
        <span className={styles.subtitle}>Season Performance Comparison</span>
      </div>

      {stats && (
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Leader</span>
            <span className={styles.statValue}>{stats.leader}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Top Score</span>
            <span className={styles.statValue}>{stats.leaderPoints.toLocaleString()}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Avg/GW</span>
            <span className={styles.statValue}>{stats.avgWeekly}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Weeks</span>
            <span className={styles.statValue}>{stats.gameweeksPlayed}</span>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.chartToggle}>
          <button
            className={styles.toggleBtn}
            data-active={chartType === 'rank'}
            onClick={() => setChartType('rank')}
          >
            League Rank
          </button>
          <button
            className={styles.toggleBtn}
            data-active={chartType === 'total'}
            onClick={() => setChartType('total')}
          >
            Total Points
          </button>
          <button
            className={styles.toggleBtn}
            data-active={chartType === 'weekly'}
            onClick={() => setChartType('weekly')}
          >
            Weekly Points
          </button>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartContainer}>
          <div className={styles.yAxis}>
            {yAxisLabels.map(({ value, y }) => (
              <span key={value} className={styles.yLabel} style={{ top: y }}>
                {chartType === 'rank' ? `#${value}` : value}
              </span>
            ))}
          </div>
          <svg className={styles.chart} viewBox="0 0 800 300" preserveAspectRatio="none">
            {/* Grid lines */}
            {yAxisLabels.map(({ value, y }) => (
              <line
                key={value}
                x1="0"
                y1={y}
                x2="800"
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}
            {/* Data lines */}
            {trends
              .filter(t => selectedManagers.has(t.managerId))
              .map((trend) => {
                const color = COLORS[trends.findIndex(t => t.managerId === trend.managerId) % COLORS.length];
                const pathPoints = trend.history.map((h) => {
                  const x = (h.event / maxGw) * 760 + 20;
                  const y = getYValue(trend, h);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polyline
                    key={trend.managerId}
                    points={pathPoints}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.trendLine}
                  />
                );
              })}
          </svg>
        </div>
        <div className={styles.xAxis}>
          {gameweeks.filter((_, i) => i % Math.ceil(gameweeks.length / 8) === 0 || i === gameweeks.length - 1).map(gw => (
            <span key={gw} className={styles.xLabel}>GW{gw}</span>
          ))}
        </div>
      </div>

      <div className={styles.legendSection}>
        <div className={styles.legendHeader}>
          <span className={styles.legendTitle}>Managers</span>
          <span className={styles.legendHint}>{selectedManagers.size} selected</span>
        </div>
        <div className={styles.legend}>
          {trends.map((trend, idx) => {
            const color = COLORS[idx % COLORS.length];
            const isSelected = selectedManagers.has(trend.managerId);
            const latestGw = trend.history[trend.history.length - 1];

            return (
              <button
                key={trend.managerId}
                className={styles.legendItem}
                data-selected={isSelected}
                onClick={() => toggleManager(trend.managerId)}
              >
                <span className={styles.legendColor} style={{ background: color }} />
                <span className={styles.legendName}>{trend.managerName}</span>
                <span className={styles.legendStats}>
                  <span className={styles.legendRank}>#{idx + 1}</span>
                  <span className={styles.legendPoints}>{latestGw?.totalPoints.toLocaleString()}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
