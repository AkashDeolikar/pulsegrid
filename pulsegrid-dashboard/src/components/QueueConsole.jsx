import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const QUEUES = ['urgent', 'normal', 'low'];
const Q_STYLE = {
  urgent: { color:'#ef4444', bg:'#1a0808', border:'#2a1010', barColor:'#ef4444' },
  normal: { color:'#63b3ed', bg:'#08101a', border:'#10182a', barColor:'#5b6cf4' },
  low:    { color:'#22c55e', bg:'#081408', border:'#101e10', barColor:'#22c55e' },
};

export default function QueueConsole({ token }) {
  const [queueStats, setQueueStats] = useState({ urgent:{}, normal:{}, low:{} });
  const [failedEvents, setFailedEvents] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [retrying,     setRetrying]     = useState(new Set());
  const [tab,          setTab]          = useState('overview'); // overview | dlq
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [autoRefresh,  setAutoRefresh]  = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${config.API_BASE}/analytics/overview`, { headers });
      setQueueStats(res.data.queues || { urgent:{}, normal:{}, low:{} });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[QueueConsole] stats fetch failed:', err);
    }
  }, [token]);

  const fetchFailed = useCallback(async () => {
    try {
      const res = await axios.get(`${config.API_BASE}/events?status=failed&limit=50`, { headers });
      setFailedEvents(res.data.events || []);
    } catch (err) {
      console.error('[QueueConsole] failed events fetch failed:', err);
    }
  }, [token]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchFailed()]);
    setLoading(false);
  }, [fetchStats, fetchFailed]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 5s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  const retryEvent = async (eventId) => {
    setRetrying(prev => new Set(prev).add(eventId));
    try {
      await axios.post(`${config.API_BASE}/events/${eventId}/retry`, {}, { headers });
      await fetchAll();
    } catch (err) {
      console.error('[QueueConsole] retry failed:', err);
    } finally {
      setRetrying(prev => { const next = new Set(prev); next.delete(eventId); return next; });
    }
  };

  const retryAll = async () => {
    if (!failedEvents.length) return;
    if (!window.confirm(`Retry all ${failedEvents.length} failed events?`)) return;
    setRetrying(new Set(failedEvents.map(e => e.id)));
    try {
      await Promise.all(
        failedEvents.map(e =>
          axios.post(`${config.API_BASE}/events/${e.id}/retry`, {}, { headers })
        )
      );
      await fetchAll();
    } catch (err) {
      console.error('[QueueConsole] retry all failed:', err);
    } finally {
      setRetrying(new Set());
    }
  };

  // Calculate total across all queues
  const totalWaiting = QUEUES.reduce((sum, q) =>
    sum + (queueStats[q]?.waiting || 0) + (queueStats[q]?.active || 0), 0
  );
  const maxDepth = Math.max(1,
    ...QUEUES.map(q => (queueStats[q]?.waiting || 0) + (queueStats[q]?.active || 0))
  );

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.topBar}>
        <div>
          <div style={S.title}>Queue Console</div>
          <div style={S.sub}>
            {loading ? 'Loading...' : `${totalWaiting} jobs pending · Updated ${lastUpdated?.toLocaleTimeString() || '—'}`}
          </div>
        </div>
        <div style={S.topActions}>
          <label style={S.autoRefreshToggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              style={{ accentColor:'#5b6cf4' }}
            />
            <span style={S.toggleLabel}>Auto-refresh (5s)</span>
          </label>
          <button style={S.refreshBtn} onClick={fetchAll}>↻ Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabRow}>
        {[
          { id:'overview', label:'Queue Overview' },
          { id:'dlq',      label:`Dead Letter Queue (${failedEvents.length})` },
        ].map(t => (
          <button
            key={t.id}
            style={{...S.tab, ...(tab===t.id?S.tabActive:{})}}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div style={S.overviewGrid}>

          {/* Queue cards */}
          {QUEUES.map(q => {
            const stats = queueStats[q] || {};
            const qs    = Q_STYLE[q];
            const depth = (stats.waiting||0) + (stats.active||0);
            const barW  = Math.min(100, (depth / maxDepth) * 100);
            return (
              <div key={q} style={{...S.qCard, borderColor: depth > 0 ? qs.border : '#14142a'}}>
                <div style={S.qCardHead}>
                  <span style={{...S.qName, color: qs.color}}>{q}</span>
                  <span style={{...S.qDepth, color: qs.color}}>{depth}</span>
                </div>

                <div style={S.qBarTrack}>
                  <div style={{...S.qBarFill, width:`${barW}%`, background:qs.barColor}} />
                </div>

                <div style={S.qStatGrid}>
                  {[
                    ['Waiting',   stats.waiting   || 0],
                    ['Active',    stats.active    || 0],
                    ['Completed', stats.completed || 0],
                    ['Failed',    stats.failed    || 0],
                  ].map(([label, val]) => (
                    <div key={label} style={S.qStat}>
                      <span style={S.qStatLabel}>{label}</span>
                      <span style={{
                        ...S.qStatVal,
                        color: label==='Failed' && val>0 ? '#ef4444' : '#a0a0c0'
                      }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Totals card */}
          <div style={S.totalsCard}>
            <div style={S.totalsTitle}>System Totals</div>
            {[
              ['Total waiting + active', totalWaiting, '#8b9cf4'],
              ['Total completed', QUEUES.reduce((s,q)=>s+(queueStats[q]?.completed||0),0), '#22c55e'],
              ['Total failed',    QUEUES.reduce((s,q)=>s+(queueStats[q]?.failed   ||0),0), '#ef4444'],
            ].map(([label, val, color]) => (
              <div key={label} style={S.totalsRow}>
                <span style={S.totalsLabel}>{label}</span>
                <span style={{...S.totalsVal, color}}>{val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DLQ TAB ── */}
      {tab === 'dlq' && (
        <div style={S.dlqSection}>
          <div style={S.dlqHeader}>
            <div style={S.dlqInfo}>
              <span style={S.dlqCount}>{failedEvents.length} failed event{failedEvents.length!==1?'s':''}</span>
              <span style={S.dlqSub}>Events that exhausted all retry attempts</span>
            </div>
            {failedEvents.length > 0 && (
              <button style={S.retryAllBtn} onClick={retryAll}>
                ↻ Retry all
              </button>
            )}
          </div>

          <div style={S.dlqList}>
            {failedEvents.length === 0 ? (
              <div style={S.emptyState}>
                <div style={S.emptyIcon}>✅</div>
                <div style={S.emptyTitle}>Dead letter queue is empty</div>
                <div style={S.emptySub}>All events delivered successfully</div>
              </div>
            ) : failedEvents.map(evt => {
              const isRetrying = retrying.has(evt.id);
              return (
                <div key={evt.id} style={S.dlqItem}>
                  <div style={S.dlqItemLeft}>
                    <div style={S.dlqItemTop}>
                      <span style={S.dlqTopic}>{evt.topic}</span>
                      <span style={S.dlqId}>{evt.id.slice(0,8)}...</span>
                      <span style={S.dlqRetries}>
                        {evt.retry_count || 0} retries
                      </span>
                    </div>
                    <div style={S.dlqPayload}>
                      {JSON.stringify(evt.payload).slice(0,80)}...
                    </div>
                    <div style={S.dlqTime}>
                      Failed at {new Date(evt.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    style={{...S.retryBtn, opacity: isRetrying ? 0.6 : 1}}
                    onClick={() => retryEvent(evt.id)}
                    disabled={isRetrying}
                  >
                    {isRetrying ? '...' : '↻ Retry'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page:          {display:'flex',flexDirection:'column',height:'calc(100vh - 56px)',background:'#08080f',fontFamily:'"JetBrains Mono","Fira Code",monospace',padding:'20px 24px',gap:'14px',overflow:'hidden'},
  topBar:        {display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexShrink:0},
  title:         {fontSize:'14px',fontWeight:'600',color:'#e8e6f0',letterSpacing:'0.04em'},
  sub:           {fontSize:'10px',color:'#3a3a5c',marginTop:'3px',letterSpacing:'0.06em'},
  topActions:    {display:'flex',gap:'10px',alignItems:'center'},
  autoRefreshToggle:{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer'},
  toggleLabel:   {fontSize:'10px',color:'#3a3a5c',letterSpacing:'0.05em'},
  refreshBtn:    {background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'5px',color:'#3a3a5c',fontSize:'10px',padding:'6px 12px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.05em'},
  tabRow:        {display:'flex',gap:'4px',flexShrink:0,borderBottom:'1px solid #0e0e1e',paddingBottom:'0'},
  tab:           {background:'transparent',border:'none',color:'#3a3a5c',fontSize:'11px',padding:'8px 16px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.04em',borderBottom:'2px solid transparent',marginBottom:'-1px',transition:'all 0.15s'},
  tabActive:     {color:'#8b9cf4',borderBottomColor:'#5b6cf4'},
  overviewGrid:  {display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',flex:1,overflow:'auto'},
  qCard:         {background:'#0d0d1a',border:'1px solid',borderRadius:'8px',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'},
  qCardHead:     {display:'flex',justifyContent:'space-between',alignItems:'center'},
  qName:         {fontSize:'12px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.1em'},
  qDepth:        {fontSize:'22px',fontWeight:'700',lineHeight:1},
  qBarTrack:     {height:'3px',background:'#0e0e1e',borderRadius:'3px',overflow:'hidden'},
  qBarFill:      {height:'100%',borderRadius:'3px',transition:'width 0.4s'},
  qStatGrid:     {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'},
  qStat:         {display:'flex',flexDirection:'column',gap:'2px'},
  qStatLabel:    {fontSize:'9px',color:'#2a2a4e',textTransform:'uppercase',letterSpacing:'0.08em'},
  qStatVal:      {fontSize:'14px',fontWeight:'600',lineHeight:1},
  totalsCard:    {background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'8px',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'},
  totalsTitle:   {fontSize:'10px',color:'#3a3a5c',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:'600'},
  totalsRow:     {display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #0e0e1e'},
  totalsLabel:   {fontSize:'10px',color:'#3a3a5c',letterSpacing:'0.04em'},
  totalsVal:     {fontSize:'14px',fontWeight:'600'},
  dlqSection:    {display:'flex',flexDirection:'column',gap:'12px',flex:1,overflow:'hidden'},
  dlqHeader:     {display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0},
  dlqInfo:       {display:'flex',flexDirection:'column',gap:'3px'},
  dlqCount:      {fontSize:'13px',fontWeight:'600',color:'#ef4444',letterSpacing:'0.03em'},
  dlqSub:        {fontSize:'10px',color:'#3a3a5c',letterSpacing:'0.05em'},
  retryAllBtn:   {background:'#0e1a0e',border:'1px solid #22c55e33',borderRadius:'5px',color:'#22c55e',fontSize:'10px',padding:'7px 14px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.04em'},
  dlqList:       {flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'},
  emptyState:    {display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:'8px'},
  emptyIcon:     {fontSize:'32px',opacity:0.6},
  emptyTitle:    {fontSize:'12px',color:'#3a3a5c',letterSpacing:'0.05em',fontWeight:'600'},
  emptySub:      {fontSize:'10px',color:'#2a2a4e',letterSpacing:'0.04em'},
  dlqItem:       {display:'flex',alignItems:'center',gap:'12px',background:'#0d0d1a',border:'1px solid #1a0808',borderRadius:'7px',padding:'12px 16px'},
  dlqItemLeft:   {flex:1,minWidth:0},
  dlqItemTop:    {display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'},
  dlqTopic:      {fontSize:'11px',color:'#8b9cf4',fontWeight:'600',letterSpacing:'0.03em'},
  dlqId:         {fontSize:'10px',color:'#3a3a5c',fontFamily:'monospace'},
  dlqRetries:    {fontSize:'9px',color:'#ef4444',background:'#1a0808',padding:'2px 7px',borderRadius:'4px',letterSpacing:'0.06em'},
  dlqPayload:    {fontSize:'10px',color:'#3a3a5c',letterSpacing:'0.02em',marginBottom:'4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  dlqTime:       {fontSize:'9px',color:'#2a2a4e',letterSpacing:'0.04em'},
  retryBtn:      {background:'#0e1a0e',border:'1px solid #22c55e33',borderRadius:'5px',color:'#22c55e',fontSize:'10px',padding:'6px 12px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.04em',flexShrink:0,transition:'opacity 0.15s'},
};