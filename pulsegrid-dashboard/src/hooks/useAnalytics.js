import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const api = axios.create({ baseURL: config.API_BASE });

export const useAnalytics = (token) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [overview, throughput, latency, topics] = await Promise.all([
        api.get('/analytics/overview',   { headers }),
        api.get('/analytics/throughput?minutes=30', { headers }),
        api.get('/analytics/latency',    { headers }),
        api.get('/analytics/topics',     { headers }),
      ]);
      setData({
        overview:   overview.data,
        throughput: throughput.data,
        latency:    latency.data,
        topics:     topics.data,
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, config.REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { data, loading, error, lastUpdated, refresh: fetchAll };
};