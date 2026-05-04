import { useState, useEffect, useRef, useCallback } from 'react';
import config from '../config';

/**
 * useEventFeed
 * Single persistent WebSocket connection per session.
 * Surfaces live events, offline sync messages, and connection status.
 */
export const useEventFeed = (token) => {
  const [events,   setEvents]   = useState([]);
  const [status,   setStatus]   = useState('disconnected');
  const [syncInfo, setSyncInfo] = useState(null);
  const wsRef                   = useRef(null);
  const retryRef                = useRef(null);
  const MAX_EVENTS              = 100;

  const connect = useCallback(() => {
    if (!token) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(`${config.WS_BASE}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      clearTimeout(retryRef.current);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case 'EVENT':
            setEvents(prev =>
              [{ ...msg, receivedAt: Date.now() }, ...prev].slice(0, MAX_EVENTS)
            );
            break;
          case 'SYNC_START':
            setSyncInfo({ phase: 'syncing', missed: msg.missedEvents });
            break;
          case 'SYNC_COMPLETE':
            setSyncInfo({ phase: 'done', missed: msg.missedEvents, delivered: msg.delivered });
            setTimeout(() => setSyncInfo(null), 4000);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('[useEventFeed] parse error:', err);
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      retryRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const clearFeed = useCallback(() => setEvents([]), []);

  return { events, status, syncInfo, clearFeed };
};