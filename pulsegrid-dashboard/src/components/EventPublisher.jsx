import { useState, useEffect } from 'react';
import axios from 'axios';
import { useEventFeed } from '../hooks/useEventFeed';
import config from '../config';

const PRIORITY_OPTIONS = [
  { value: 'auto',   label: 'Auto — let classifier decide', color: '#8b9cf4' },
  { value: 'urgent', label: 'Urgent — instant delivery',    color: '#ef4444' },
  { value: 'normal', label: 'Normal — standard queue',      color: '#63b3ed' },
  { value: 'low',    label: 'Low — batch queue',            color: '#22c55e' },
];

const PRIORITY_COLORS = {
  urgent: { bg: '#1a0808', border: '#2a1010', text: '#ef4444' },
  normal: { bg: '#08101a', border: '#10182a', text: '#63b3ed' },
  low:    { bg: '#081408', border: '#101e10', text: '#22c55e' },
};

const SAMPLE_PAYLOADS = [
  { label: 'Order',   value: '{\n  "orderId": "ORD-001",\n  "amount": 1500,\n  "status": "placed"\n}' },
  { label: 'Payment', value: '{\n  "txId": "TXN-999",\n  "amount": 25000,\n  "status": "failed"\n}' },
  { label: 'Alert',   value: '{\n  "service": "auth-api",\n  "error": "timeout",\n  "level": "critical"\n}' },
];

export default function EventPublisher({ token }) {
  // Publish form
  const [topic,       setTopic]       = useState('');
  const [payload,     setPayload]     = useState('{\n  "orderId": "ORD-001",\n  "amount": 1500\n}');
  const [priority,    setPriority]    = useState('auto');
  const [publishing,  setPublishing]  = useState(false);
  const [publishMsg,  setPublishMsg]  = useState(null); // { type: 'success'|'error', text, meta }

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState([]);
  const [subTopic,      setSubTopic]      = useState('');
  const [subLoading,    setSubLoading]    = useState(false);
  const [subError,      setSubError]      = useState('');

  // Live feed from WebSocket hook
  const { events, status, syncInfo, clearFeed } = useEventFeed(token);

  // Fetch subscriptions on mount
  useEffect(() => { fetchSubscriptions(); }, []);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get(`${config.API_BASE}/subscriptions/my`, { headers });
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      console.error('[Subscriptions] fetch failed:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!subTopic.trim()) { setSubError('Enter a topic'); return; }
    setSubLoading(true);
    setSubError('');
    try {
      await axios.post(`${config.API_BASE}/subscriptions/subscribe`,
        { topic: subTopic.trim() }, { headers }
      );
      setSubTopic('');
      fetchSubscriptions();
    } catch (err) {
      setSubError(err.response?.data?.error || 'Failed');
    } finally {
      setSubLoading(false);
    }
  };

  const handleUnsubscribe = async (t) => {
    try {
      await axios.delete(`${config.API_BASE}/subscriptions/unsubscribe`,
        { headers, data: { topic: t } }
      );
      fetchSubscriptions();
    } catch (err) {
      console.error('[Unsubscribe] failed:', err);
    }
  };

  const handlePublish = async () => {
    if (!topic.trim()) {
      setPublishMsg({ type: 'error', text: 'Topic is required' });
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setPublishMsg({ type: 'error', text: 'Payload must be valid JSON' });
      return;
    }

    setPublishing(true);
    setPublishMsg(null);
    try {
      const res = await axios.post(`${config.API_BASE}/events/publish`, {
        topic:    topic.trim(),
        payload:  parsed,
        priority: priority === 'auto' ? undefined : priority,
      }, { headers });

      setPublishMsg({
        type: 'success',
        text: `Published · ID: ${res.data.eventId.slice(0, 8)}...`,
        meta: {
          priority:   res.data.priority,
          source:     res.data.classifierSource,
          confidence: res.data.confidence,
        },
      });
      setTopic('');
    } catch (err) {
      setPublishMsg({ type: 'error', text: err.response?.data?.error || 'Publish failed' });
    } finally {
      setPublishing(false);
    }
  };

  const statusConfig = {
    connected:    { color: '#22c55e', label: '● connected' },
    connecting:   { color: '#f59e0b', label: '◌ connecting' },
    disconnected: { color: '#ef4444', label: '○ disconnected' },
  }[status] || { color: '#ef4444', label: '○ offline' };

  return (
    <div style={S.page}>

      {/* ══ LEFT — SUBSCRIPTIONS ══ */}
      <div style={S.panel}>
        <div style={S.panelHead}>
          <span style={S.panelTitle}>Subscriptions</span>
          <span style={S.panelCount}>{subscriptions.length}</span>
        </div>

        {/* Subscribe input */}
        <div style={S.subInputRow}>
          <input
            style={S.subInput}
            type="text"
            value={subTopic}
            onChange={e => { setSubTopic(e.target.value); setSubError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
            placeholder="topic name"
          />
          <button
            style={{ ...S.subBtn, opacity: subLoading ? 0.6 : 1 }}
            onClick={handleSubscribe}
            disabled={subLoading}
          >
            {subLoading ? '...' : '+'}
          </button>
        </div>
        {subError && <div style={S.subError}>{subError}</div>}

        {/* Subscription list */}
        <div style={S.subList}>
          {subscriptions.length === 0 ? (
            <div style={S.emptyMsg}>
              No subscriptions yet.<br />
              Add a topic to receive events.
            </div>
          ) : (
            subscriptions.map(sub => (
              <div key={sub.topic} style={S.subItem}>
                <div style={S.subDot} />
                <span style={S.subName}>{sub.topic}</span>
                <button
                  style={S.subRemove}
                  onClick={() => handleUnsubscribe(sub.topic)}
                  title="Unsubscribe"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Spacer + hint */}
        <div style={{ flex: 1 }} />
        <div style={S.hint}>
          Subscribe to a topic, then publish an event to see it arrive in the live feed →
        </div>
      </div>

      {/* ══ MIDDLE — PUBLISH ══ */}
      <div style={S.panel}>
        <div style={S.panelHead}>
          <span style={S.panelTitle}>Publish Event</span>
        </div>

        {/* Topic */}
        <label style={S.fieldLabel}>Topic</label>
        <input
          style={S.input}
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="orders"
        />

        {/* Payload */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={S.fieldLabel}>Payload (JSON)</label>
          <div style={S.sampleRow}>
            {SAMPLE_PAYLOADS.map(s => (
              <button
                key={s.label}
                style={S.sampleBtn}
                onClick={() => setPayload(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          style={S.textarea}
          value={payload}
          onChange={e => setPayload(e.target.value)}
          spellCheck={false}
          rows={6}
        />

        {/* Priority */}
        <label style={S.fieldLabel}>Priority</label>
        <div style={S.priorityGrid}>
          {PRIORITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              style={{
                ...S.priorityBtn,
                borderColor: priority === opt.value ? opt.color : '#14142a',
                color:       priority === opt.value ? opt.color : '#3a3a5c',
                background:  priority === opt.value ? `${opt.color}11` : '#080810',
              }}
              onClick={() => setPriority(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          style={{ ...S.publishBtn, opacity: publishing ? 0.65 : 1 }}
          onClick={handlePublish}
          disabled={publishing}
        >
          {publishing ? 'Publishing...' : 'Publish event →'}
        </button>

        {/* Result */}
        {publishMsg && (
          <div style={{
            ...S.publishResult,
            borderColor: publishMsg.type === 'success' ? '#22c55e33' : '#ef444433',
            background:  publishMsg.type === 'success' ? '#08140a' : '#140808',
          }}>
            <div style={{
              fontSize: '11px',
              color: publishMsg.type === 'success' ? '#22c55e' : '#ef4444',
              marginBottom: publishMsg.meta ? '6px' : 0,
            }}>
              {publishMsg.type === 'success' ? '✓' : '✕'} {publishMsg.text}
            </div>
            {publishMsg.meta && (
              <div style={S.classifyMeta}>
                <span style={S.metaChip}>
                  priority: <strong>{publishMsg.meta.priority}</strong>
                </span>
                <span style={S.metaChip}>
                  source: <strong>{publishMsg.meta.source}</strong>
                </span>
                <span style={S.metaChip}>
                  confidence: <strong>{publishMsg.meta.confidence}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ RIGHT — LIVE FEED ══ */}
      <div style={S.panel}>
        <div style={S.panelHead}>
          <span style={S.panelTitle}>Live Feed</span>
          <div style={S.feedControls}>
            <span style={{ ...S.wsStatus, color: statusConfig.color }}>
              {statusConfig.label}
            </span>
            {events.length > 0 && (
              <button style={S.clearBtn} onClick={clearFeed}>clear</button>
            )}
          </div>
        </div>

        {/* Sync banner */}
        {syncInfo && (
          <div style={S.syncBanner}>
            {syncInfo.phase === 'syncing'
              ? `⟳ Syncing ${syncInfo.missed} missed events...`
              : `✓ Synced ${syncInfo.delivered} events`
            }
          </div>
        )}

        {/* Events */}
        <div style={S.feed}>
          {events.length === 0 ? (
            <div style={S.feedEmpty}>
              <div style={S.feedEmptyIcon}>📡</div>
              <div>Waiting for events</div>
              <div style={{ fontSize: '10px', marginTop: '4px', color: '#2a2a4e' }}>
                Publish an event to see it here
              </div>
            </div>
          ) : (
            events.map((evt, idx) => {
              const pColor = PRIORITY_COLORS[evt.priority] || PRIORITY_COLORS.normal;
              return (
                <div key={idx} style={S.feedItem}>
                  <div style={S.feedItemTop}>
                    <span style={S.feedTopic}>{evt.topic}</span>
                    <span style={{
                      ...S.feedPriority,
                      background: pColor.bg,
                      border:     `1px solid ${pColor.border}`,
                      color:      pColor.text,
                    }}>
                      {evt.priority}
                    </span>
                    <span style={S.feedTime}>
                      {new Date(evt.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div style={S.feedPayload}>
                    {JSON.stringify(evt.payload).slice(0, 90)}
                    {JSON.stringify(evt.payload).length > 90 ? '...' : ''}
                  </div>
                  {evt.replayed && (
                    <div style={S.replayedBadge}>replayed</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Feed count */}
        {events.length > 0 && (
          <div style={S.feedFooter}>
            {events.length} event{events.length !== 1 ? 's' : ''} · showing last {Math.min(events.length, 100)}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page: {
    display:              'grid',
    gridTemplateColumns:  '280px 1fr 320px',
    gap:                  '1px',
    height:               'calc(100vh - 56px)',
    background:           '#14142a',
    fontFamily:           '"JetBrains Mono", "Fira Code", monospace',
    overflow:             'hidden',
  },
  panel: {
    background:     '#08080f',
    padding:        '20px',
    display:        'flex',
    flexDirection:  'column',
    overflow:       'hidden',
  },
  panelHead: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   '16px',
  },
  panelTitle: {
    fontSize:       '11px',
    fontWeight:     '600',
    color:          '#3a3a5c',
    textTransform:  'uppercase',
    letterSpacing:  '0.1em',
  },
  panelCount: {
    fontSize:       '11px',
    color:          '#5b6cf4',
    background:     '#10102a',
    padding:        '2px 8px',
    borderRadius:   '10px',
    border:         '1px solid #1e1e3a',
  },
  subInputRow: {
    display:        'flex',
    gap:            '8px',
    marginBottom:   '8px',
  },
  subInput: {
    flex:           1,
    background:     '#0d0d1a',
    border:         '1px solid #14142a',
    borderRadius:   '5px',
    padding:        '8px 10px',
    color:          '#e8e6f0',
    fontSize:       '11px',
    outline:        'none',
    fontFamily:     'inherit',
  },
  subBtn: {
    background:     '#5b6cf4',
    border:         'none',
    borderRadius:   '5px',
    color:          '#fff',
    fontSize:       '16px',
    width:          '36px',
    cursor:         'pointer',
    fontFamily:     'inherit',
    lineHeight:     1,
  },
  subError: {
    fontSize:       '10px',
    color:          '#ef4444',
    marginBottom:   '8px',
    letterSpacing:  '0.04em',
  },
  subList: {
    display:        'flex',
    flexDirection:  'column',
    gap:            '4px',
    overflowY:      'auto',
    maxHeight:      '240px',
  },
  subItem: {
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    background:     '#0d0d1a',
    border:         '1px solid #14142a',
    borderRadius:   '5px',
    padding:        '7px 10px',
  },
  subDot: {
    width:          '5px',
    height:         '5px',
    borderRadius:   '50%',
    background:     '#22c55e',
    boxShadow:      '0 0 5px #22c55e88',
    flexShrink:     0,
  },
  subName: {
    flex:           1,
    fontSize:       '11px',
    color:          '#a0a0c0',
  },
  subRemove: {
    background:     'none',
    border:         'none',
    color:          '#2a2a4e',
    cursor:         'pointer',
    fontSize:       '10px',
    padding:        '0 2px',
    fontFamily:     'inherit',
    lineHeight:     1,
  },
  emptyMsg: {
    fontSize:       '10px',
    color:          '#2a2a4e',
    padding:        '12px 0',
    lineHeight:     '1.7',
    letterSpacing:  '0.03em',
  },
  hint: {
    fontSize:       '10px',
    color:          '#1e1e3a',
    lineHeight:     '1.6',
    paddingTop:     '12px',
    borderTop:      '1px solid #0e0e1e',
    letterSpacing:  '0.03em',
  },
  fieldLabel: {
    fontSize:       '10px',
    color:          '#3a3a5c',
    textTransform:  'uppercase',
    letterSpacing:  '0.1em',
    display:        'block',
    marginBottom:   '6px',
    marginTop:      '12px',
  },
  input: {
    width:          '100%',
    background:     '#0d0d1a',
    border:         '1px solid #14142a',
    borderRadius:   '5px',
    padding:        '9px 12px',
    color:          '#e8e6f0',
    fontSize:       '12px',
    outline:        'none',
    fontFamily:     'inherit',
  },
  sampleRow: {
    display:        'flex',
    gap:            '4px',
    marginTop:      '12px',
  },
  sampleBtn: {
    background:     '#0d0d1a',
    border:         '1px solid #14142a',
    borderRadius:   '4px',
    color:          '#3a3a5c',
    fontSize:       '9px',
    padding:        '3px 8px',
    cursor:         'pointer',
    fontFamily:     'inherit',
    letterSpacing:  '0.05em',
  },
  textarea: {
    width:          '100%',
    background:     '#0d0d1a',
    border:         '1px solid #14142a',
    borderRadius:   '5px',
    padding:        '10px 12px',
    color:          '#8b9cf4',
    fontSize:       '11px',
    outline:        'none',
    fontFamily:     '"JetBrains Mono", "Fira Code", monospace',
    resize:         'vertical',
    lineHeight:     '1.6',
  },
  priorityGrid: {
    display:        'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:            '6px',
    marginBottom:   '4px',
  },
  priorityBtn: {
    background:     '#080810',
    border:         '1px solid #14142a',
    borderRadius:   '5px',
    padding:        '8px 10px',
    fontSize:       '10px',
    cursor:         'pointer',
    textAlign:      'left',
    fontFamily:     'inherit',
    letterSpacing:  '0.03em',
    transition:     'all 0.15s',
    lineHeight:     '1.3',
  },
  publishBtn: {
    width:          '100%',
    background:     '#5b6cf4',
    border:         'none',
    borderRadius:   '6px',
    padding:        '11px',
    color:          '#fff',
    fontSize:       '12px',
    fontWeight:     '600',
    cursor:         'pointer',
    fontFamily:     'inherit',
    letterSpacing:  '0.04em',
    marginTop:      '14px',
    boxShadow:      '0 4px 20px #5b6cf433',
    transition:     'opacity 0.15s',
  },
  publishResult: {
    marginTop:      '10px',
    padding:        '10px 12px',
    borderRadius:   '6px',
    border:         '1px solid',
  },
  classifyMeta: {
    display:        'flex',
    flexWrap:       'wrap',
    gap:            '6px',
  },
  metaChip: {
    fontSize:       '10px',
    color:          '#4a4a6a',
    background:     '#0e0e1e',
    padding:        '3px 8px',
    borderRadius:   '4px',
    border:         '1px solid #1a1a2e',
    letterSpacing:  '0.03em',
  },
  feedControls: {
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
  },
  wsStatus: {
    fontSize:       '10px',
    letterSpacing:  '0.05em',
  },
  clearBtn: {
    background:     'none',
    border:         '1px solid #14142a',
    borderRadius:   '4px',
    color:          '#3a3a5c',
    fontSize:       '9px',
    padding:        '3px 8px',
    cursor:         'pointer',
    fontFamily:     'inherit',
    letterSpacing:  '0.05em',
  },
  syncBanner: {
    fontSize:       '10px',
    color:          '#f59e0b',
    background:     '#140e08',
    border:         '1px solid #2a1e10',
    borderRadius:   '5px',
    padding:        '7px 10px',
    marginBottom:   '10px',
    letterSpacing:  '0.04em',
  },
  feed: {
    flex:           1,
    overflowY:      'auto',
    display:        'flex',
    flexDirection:  'column',
    gap:            '6px',
  },
  feedEmpty: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    color:          '#2a2a4e',
    fontSize:       '11px',
    gap:            '6px',
    letterSpacing:  '0.04em',
  },
  feedEmptyIcon: {
    fontSize:       '28px',
    marginBottom:   '4px',
    opacity:        0.4,
  },
  feedItem: {
    background:     '#0d0d1a',
    border:         '1px solid #14142a',
    borderRadius:   '6px',
    padding:        '10px 12px',
    flexShrink:     0,
  },
  feedItemTop: {
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    marginBottom:   '6px',
  },
  feedTopic: {
    flex:           1,
    fontSize:       '11px',
    fontWeight:     '600',
    color:          '#8b9cf4',
    letterSpacing:  '0.04em',
  },
  feedPriority: {
    fontSize:       '9px',
    padding:        '2px 7px',
    borderRadius:   '4px',
    letterSpacing:  '0.06em',
    fontWeight:     '500',
  },
  feedTime: {
    fontSize:       '9px',
    color:          '#2a2a4e',
    letterSpacing:  '0.04em',
  },
  feedPayload: {
    fontSize:       '10px',
    color:          '#3a3a5c',
    lineHeight:     '1.5',
    letterSpacing:  '0.02em',
    wordBreak:      'break-all',
  },
  replayedBadge: {
    marginTop:      '5px',
    fontSize:       '9px',
    color:          '#f59e0b',
    letterSpacing:  '0.06em',
  },
  feedFooter: {
    fontSize:       '9px',
    color:          '#1e1e3a',
    letterSpacing:  '0.05em',
    marginTop:      '8px',
    paddingTop:     '8px',
    borderTop:      '1px solid #0e0e1e',
    textAlign:      'center',
  },
};