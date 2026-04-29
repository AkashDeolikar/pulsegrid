const { calculateZScore } = require('../../services/anomaly.detector');

describe('Anomaly Detector — calculateZScore', () => {

  describe('Normal traffic — no anomaly', () => {
    test('returns zScore near 0 for stable traffic', () => {
      const values = [10, 11, 10, 12, 10, 11, 10, 10, 12, 11];
      const { zScore } = calculateZScore(values);
      expect(Math.abs(zScore)).toBeLessThan(1.0);
    });

    test('returns zScore 0 when all values are identical', () => {
      const values = [5, 5, 5, 5, 5, 5];
      const { zScore } = calculateZScore(values);
      expect(zScore).toBe(0);
    });
  });

  describe('Spike detection', () => {
    test('detects a clear traffic spike (Z > 2)', () => {
      // 9 normal minutes + 1 massive spike
      const values = [10, 10, 10, 10, 10, 10, 10, 10, 10, 100];
      const { zScore } = calculateZScore(values);
      expect(zScore).toBeGreaterThan(2.0);
    });

    test('returns correct mean and stddev', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const { mean, stddev } = calculateZScore(values);
      expect(mean).toBeCloseTo(5.0, 1);
      expect(stddev).toBeCloseTo(2.0, 0);
    });

    test('critical spike produces Z above 3', () => {
      const values = [5, 5, 5, 5, 5, 5, 5, 5, 5, 500];
      const { zScore } = calculateZScore(values);
      expect(zScore).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('Insufficient data', () => {
    test('returns zScore 0 when fewer than 5 samples', () => {
      const { zScore } = calculateZScore([10, 20, 30]);
      expect(zScore).toBe(0);
    });

    test('returns zScore 0 for empty array', () => {
      const { zScore } = calculateZScore([]);
      expect(zScore).toBe(0);
    });
  });

  describe('Result shape', () => {
    test('always returns zScore, mean, stddev', () => {
      const result = calculateZScore([1, 2, 3, 4, 5, 6]);
      expect(result).toHaveProperty('zScore');
      expect(result).toHaveProperty('mean');
      expect(result).toHaveProperty('stddev');
    });
  });
});