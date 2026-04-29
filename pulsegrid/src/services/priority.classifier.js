/**
 * PulseGrid Priority Classifier
 * Analyzes event payload and topic to auto-assign priority.
 * Uses weighted keyword scoring + topic rules — explainable and fast.
 * No black-box ML needed: every decision can be traced and explained.
 */

const URGENT_KEYWORDS = [
  'payment', 'failed', 'error', 'critical', 'alert',
  'emergency', 'fraud', 'breach', 'timeout', 'crash',
  'expired', 'declined', 'unauthorized', 'outage', 'down'
];

const LOW_KEYWORDS = [
  'analytics', 'log', 'metric', 'report', 'summary',
  'digest', 'batch', 'audit', 'archive', 'statistics'
];

const URGENT_TOPICS = ['payments', 'alerts', 'errors', 'security', 'auth'];
const LOW_TOPICS    = ['analytics', 'logs', 'reports', 'metrics', 'digest'];

const scorePayload = (payload) => {
  const text = JSON.stringify(payload).toLowerCase();
  let score = 0;

  URGENT_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) score += 10;
  });

  LOW_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) score -= 5;
  });

  // High monetary value = higher urgency
  const amounts = text.match(/\d+/g)?.map(Number) || [];
  const maxAmount = Math.max(...amounts, 0);
  if (maxAmount > 10000) score += 8;
  else if (maxAmount > 1000) score += 3;

  // Status field signals
  if (text.includes('"status":"failed"'))   score += 15;
  if (text.includes('"status":"error"'))    score += 15;
  if (text.includes('"status":"success"'))  score -= 2;

  return score;
};

const classifyPriority = (topic = '', payload = {}, manualPriority = null) => {
  // Manual override always wins — producer knows their domain best
  if (manualPriority && ['urgent','normal','low'].includes(manualPriority)) {
    return { priority: manualPriority, source: 'manual', confidence: 1.0 };
  }

  // Topic-level rules (fast path)
  const t = topic.toLowerCase();
  if (URGENT_TOPICS.some(ut => t.includes(ut))) {
    return { priority: 'urgent', source: 'topic_rule', confidence: 0.9 };
  }
  if (LOW_TOPICS.some(lt => t.includes(lt))) {
    return { priority: 'low', source: 'topic_rule', confidence: 0.9 };
  }

  // Payload scoring (slow path)
  const score = scorePayload(payload);

  if (score >= 10) return { priority: 'urgent', source: 'classifier', confidence: Math.min(score / 30, 1) };
  if (score <= -5) return { priority: 'low',    source: 'classifier', confidence: 0.7 };
  return             { priority: 'normal',  source: 'classifier', confidence: 0.6 };
};

module.exports = { classifyPriority };