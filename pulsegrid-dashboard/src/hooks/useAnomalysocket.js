import { useState, useEffect, useRef } from 'react';
import config from '../config';

export const useAnomalySocket = (token) => {
  const [alerts, setAlerts]       = useState([]);
  const [wsStatus, setWsStatus]   = useState('disconnected');
  const wsRef                     = useRef(null);

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      const ws = new WebSocket(`${config.WS_BASE}?token=${token}`);
      wsRef.current = ws;

      ws.onopen  = () => setWsStatus('connected');
      ws.onclose = () => {
        setWsStatus('disconnected');
        // Auto-reconnect after 3s
        setTimeout(connect, 3000);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'ANOMALY_ALERT') {
            setAlerts(prev => [msg, ...prev].slice(0, 50)); // keep last 50
          }
        } catch {}
      };
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [token]);

  return { alerts, wsStatus };
};