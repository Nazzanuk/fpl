/**
 * Math Utilities for FPL Calculations
 */

/**
 * Calculate quartiles from an array of numbers
 */
export function calculateQuartiles(values: number[]): { q1: number; q2: number; q3: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  if (n === 0) return { q1: 0, q2: 0, q3: 0 };
  if (n === 1) return { q1: sorted[0], q2: sorted[0], q3: sorted[0] };
  if (n === 2) return { q1: sorted[0], q2: (sorted[0] + sorted[1]) / 2, q3: sorted[1] };
  if (n === 3) return { q1: sorted[0], q2: sorted[1], q3: sorted[2] };

  // Calculate median (Q2)
  const q2 = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  // Calculate Q1 (median of lower half)
  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const q1 = lowerHalf.length % 2 === 0
    ? (lowerHalf[lowerHalf.length / 2 - 1] + lowerHalf[lowerHalf.length / 2]) / 2
    : lowerHalf[Math.floor(lowerHalf.length / 2)];

  // Calculate Q3 (median of upper half)
  const upperHalf = n % 2 === 0
    ? sorted.slice(n / 2)
    : sorted.slice(Math.floor(n / 2) + 1);
  const q3 = upperHalf.length % 2 === 0
    ? (upperHalf[upperHalf.length / 2 - 1] + upperHalf[upperHalf.length / 2]) / 2
    : upperHalf[Math.floor(upperHalf.length / 2)];

  return { q1, q2, q3 };
}

/**
 * Calculate Tukey's Trimean: (Q1 + 2*Q2 + Q3) / 4
 */
export function calculateTrimean(values: number[]): number {
  if (values.length === 0) return 0;
  const { q1, q2, q3 } = calculateQuartiles(values);
  return (q1 + 2 * q2 + q3) / 4;
}

/**
 * Calculate median from an array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
}
