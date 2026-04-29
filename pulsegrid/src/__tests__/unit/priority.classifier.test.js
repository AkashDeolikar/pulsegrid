const { classifyPriority } = require('../../services/priority.classifier');

describe('Priority Classifier', () => {

  describe('Manual override', () => {
    test('returns manual priority when explicitly set to urgent', () => {
      const result = classifyPriority('analytics', { pageViews: 100 }, 'urgent');
      expect(result.priority).toBe('urgent');
      expect(result.source).toBe('manual');
      expect(result.confidence).toBe(1.0);
    });

    test('returns manual priority when explicitly set to low', () => {
      const result = classifyPriority('payments', { amount: 50000 }, 'low');
      expect(result.priority).toBe('low');
      expect(result.source).toBe('manual');
    });

    test('ignores manual priority if value is invalid', () => {
      const result = classifyPriority('payments', { amount: 50000 }, 'superurgent');
      expect(result.source).not.toBe('manual');
    });
  });

  describe('Topic rule fast path', () => {
    test('classifies payments topic as urgent', () => {
      const result = classifyPriority('payments', { amount: 100 });
      expect(result.priority).toBe('urgent');
      expect(result.source).toBe('topic_rule');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    test('classifies alerts topic as urgent', () => {
      const result = classifyPriority('alerts', { message: 'disk full' });
      expect(result.priority).toBe('urgent');
      expect(result.source).toBe('topic_rule');
    });

    test('classifies analytics topic as low', () => {
      const result = classifyPriority('analytics', { sessions: 400 });
      expect(result.priority).toBe('low');
      expect(result.source).toBe('topic_rule');
    });

    test('classifies logs topic as low', () => {
      const result = classifyPriority('logs', { level: 'info' });
      expect(result.priority).toBe('low');
      expect(result.source).toBe('topic_rule');
    });
  });

  describe('Payload scoring slow path', () => {
    test('detects urgent from failed status in payload', () => {
      const result = classifyPriority('system', { service: 'auth', status: 'failed' });
      expect(result.priority).toBe('urgent');
      expect(result.source).toBe('classifier');
    });

    test('detects urgent from error keyword in payload', () => {
      const result = classifyPriority('system', { message: 'critical error in service' });
      expect(result.priority).toBe('urgent');
      expect(result.source).toBe('classifier');
    });

    test('detects urgent from high transaction amount', () => {
      const result = classifyPriority('transactions', { amount: 25000 });
      expect(result.priority).toBe('urgent');
      expect(result.source).toBe('classifier');
    });

    test('returns normal for neutral payload', () => {
      const result = classifyPriority('orders', { orderId: 'ORD-100', item: 'book' });
      expect(result.priority).toBe('normal');
      expect(result.source).toBe('classifier');
    });

    test('detects low from analytics keywords', () => {
      const result = classifyPriority('system', { type: 'report', summary: 'daily digest' });
      expect(result.priority).toBe('low');
    });
  });

  describe('Edge cases', () => {
    test('handles empty payload gracefully', () => {
      const result = classifyPriority('orders', {});
      expect(result).toHaveProperty('priority');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('confidence');
    });

    test('handles missing topic gracefully', () => {
      const result = classifyPriority('', { amount: 100 });
      expect(result).toHaveProperty('priority');
    });

    test('result always has priority, source, confidence', () => {
      const result = classifyPriority('anything', { x: 1 });
      expect(['urgent','normal','low']).toContain(result.priority);
      expect(result.confidence).toBeGreaterThan(0);
      expect(typeof result.source).toBe('string');
    });
  });
});