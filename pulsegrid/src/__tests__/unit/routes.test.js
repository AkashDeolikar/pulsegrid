jest.mock('../../controllers/analytics.controller', () => ({
  getOverview: jest.fn(),
  getThroughputData: jest.fn(),
  getLatencyData: jest.fn(),
  getAnomalies: jest.fn(),
  getTopics: jest.fn(),
}));

const analyticsRoutes = require('../../routes/analytics.routes');
const subscriptionRoutes = require('../../routes/subscription.routes');

describe('Route definitions', () => {
  test('analytics routes expose the expected endpoints', () => {
    const paths = analyticsRoutes.stack.map((layer) => layer.route.path);
    expect(paths).toEqual(['/overview', '/throughput', '/latency', '/anomalies', '/topics']);
    const methods = analyticsRoutes.stack.map((layer) => Object.keys(layer.route.methods).sort());
    expect(methods).toEqual([['get'], ['get'], ['get'], ['get'], ['get']]);
  });

  test('subscription routes expose subscribe, unsubscribe, and my endpoints', () => {
    const paths = subscriptionRoutes.stack.map((layer) => layer.route.path);
    expect(paths).toEqual(['/subscribe', '/unsubscribe', '/my']);
    const methods = subscriptionRoutes.stack.map((layer) => Object.keys(layer.route.methods).sort());
    expect(methods).toEqual([['post'], ['delete'], ['get']]);
  });
});
