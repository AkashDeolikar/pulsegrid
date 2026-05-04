import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

export default function TopicExplorer({ token }) {
  const [topics,        setTopics]        = useState([]);
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [recentEvents,  setRecentEvents]  = useState({});  // topic -> events[]
  const [expanded,      setExpanded]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [sort,          setSort]          = useState('count'); // count | name | recent
  const [flash,         setFlash]         = useState(null);
  const [subscribing,   setSubscribing]   = useState(new Set());

  const headers = { Authorization: `Bearer ${token}` };

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 2500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [topicRes, subRes] = await Promise.all([
        axios.get(`${config.API_BASE}/analytics/topics`, { headers }),
        axios.get(`${config.API_BASE}/subscriptions/my`, { headers }),
      ]);
      setTopics(topicRes.data.topics || []);
      setSubscriptions(new Set((subRes.data.subscriptions || []).map(s => s.topic)));
    } catch (err) {
      console.error('[TopicExplorer]', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchTopicEvents = async (topic) => {
    if (recentEvents[topic]) return; // already loaded
    try {
      const res = await axios.get(
        `${config.API_BASE}/events?topic=${topic}&limit=5`,
        { headers }
      );
      setRecentEvents(prev => ({ ...prev, [topic]: res.data.events || [] }));
    } catch (err) {
      console.error('[TopicExplorer] events fetch:', err);
    }
  };

  const toggleExpand = (topic) => {
    if (expanded === topic) {
      setExpanded(null);
    } else {
      setExpanded(topic);
      fetchTopicEvents(topic);
    }
  };

  const handleSubscribe = async (topic) => {
    setSubscribing(prev => new Set(prev).add(topic));
    try {
      await axios.post(
        `${config.API_BASE}/subscriptions/subscribe`,
        { topic }, { headers }
      );
      setSubscriptions(prev => new Set(prev).add(topic));
      showFlash('success', `Subscribed to ${topic}`);
    } catch (err) {
      showFlash('error', err.response?.data?.error || 'Failed');
    } finally {
      setSubscribing(prev => { const n = new Set(prev); n.delete(topic); return n; });
    }
  };

  const handleUnsubscribe = async (topic) => {
    setSubscribing(prev => new Set(prev).add(topic));
    try {
      await axios.delete(
        `${config.API_BASE}/subscriptions/unsubscribe`,
        { headers, data: { topic } }
      );
      setSubscriptions(prev => { const n = new Set(prev); n.delete(topic); return n; });
      showFlash('success', `Unsubscribed from ${topic}`);
    } catch (err) {
      showFlash('error', 'Failed');
    } finally {
      setSubscribing(prev => { const n = new Set(prev); n.delete(topic); return n; });
    }
  };

  // Filter + sort
  const filtered = topics
    .filter(t => t.topic.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'count')  return b.count - a.count;
      if (sort === 'name')   return a.topic.localeCompare(b.topic);
      return 0;
    });

  const maxCount  = Math.max(...topics.map(t => t.count), 1);
  const subCount  = subscriptions.size;

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.topBar}>
        <div>
          <div style={S.title}>Topic Explorer</div>
          <div style={S.sub}>
            {topics.length} topics · {subCount} subscribed
          </div>
        </div>
        <div style={S.topRight}>
          {flash && (
            <div style={{
              ...S.flash,
              color:      flash.type === 'success' ? '#22c55e' : '#ef4444',
              background: flash.type === 'success' ? '#08140a' : '#140808',
              border:     `1px solid ${flash.type === 'success' ? '#22c55e33' : '#ef444433'}`,
            }}>
              {flash.text}
            </div>
          )}
          <button style={S.refreshBtn} onClick={fetchAll}>↻</button>
        </div>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <input
          style={S.search}
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={S.sortGroup}>
          <span style={S.sortLabel}>Sort</span>
          {[
            { id:'count', label:'By events' },
            { id:'name',  label:'By name'   },
          ].map(opt => (
            <button
              key={opt.id}
              style={{ ...S.sortBtn, ...(sort === opt.id ? S.sortBtnActive : {}) }}
              onClick={() => setSort(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={S.summaryChips}>
          <span style={S.chip}>
            {topics.length} topics
          </span>
          <span style={{ ...S.chip, color:'#22c55e', background:'#08140a', border:'1px solid #22c55e22' }}>
            {subCount} subscribed
          </span>
        </div>
      </div>

      {/* Topic list */}
      <div style={S.list}>
        {loading ? (
          <div style={S.centerMsg}>Loading topics...</div>
        ) : filtered.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>🔍</div>
            <div style={S.emptyTitle}>No topics found</div>
            <div style={S.emptySub}>
              {topics.length === 0
                ? 'No events have been published yet'
                : 'Try a different search term'}
            </div>
          </div>
        ) : filtered.map(({ topic, count }) => {
          const isSub       = subscriptions.has(topic);
          const isBusy      = subscribing.has(topic);
          const isExpanded  = expanded === topic;
          const barW        = Math.min(100, (count / maxCount) * 100);
          const events      = recentEvents[topic] || [];

          return (
            <div key={topic} style={{
              ...S.topicCard,
              borderColor: isSub ? '#5b6cf444' : '#14142a',
              background:  isExpanded ? '#0d0d1a' : '#0a0a12',
            }}>
              {/* Main row */}
              <div style={S.topicRow}>
                {/* Left: dot + name */}
                <div style={S.topicLeft}>
                  <div style={{
                    ...S.topicDot,
                    background:  isSub ? '#22c55e' : '#2a2a4e',
                    boxShadow:   isSub ? '0 0 5px #22c55e88' : 'none',
                  }} />
                  <span style={S.topicName}>{topic}</span>
                  {isSub && <span style={S.subTag}>subscribed</span>}
                </div>

                {/* Middle: bar + count */}
                <div style={S.topicMid}>
                  <div style={S.barTrack}>
                    <div style={{ ...S.barFill, width:`${barW}%` }} />
                  </div>
                  <span style={S.countLabel}>{count.toLocaleString()} events</span>
                </div>

                {/* Right: actions */}
                <div style={S.topicActions}>
                  <button
                    style={S.expandBtn}
                    onClick={() => toggleExpand(topic)}
                  >
                    {isExpanded ? '▲ Hide' : '▼ Preview'}
                  </button>
                  <button
                    style={{
                      ...S.subBtn,
                      ...(isSub ? S.subBtnActive : {}),
                      opacity: isBusy ? 0.6 : 1,
                    }}
                    onClick={() => isSub ? handleUnsubscribe(topic) : handleSubscribe(topic)}
                    disabled={isBusy}
                  >
                    {isBusy ? '...' : isSub ? '− Unsubscribe' : '+ Subscribe'}
                  </button>
                </div>
              </div>

              {/* Expanded: recent events */}
              {isExpanded && (
                <div style={S.previewSection}>
                  <div style={S.previewTitle}>Recent events</div>
                  {events.length === 0 ? (
                    <div style={S.previewEmpty}>No recent events to show</div>
                  ) : events.map(evt => (
                    <div key={evt.id} style={S.previewRow}>
                      <span style={S.previewTime}>
                        {new Date(evt.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                      </span>
                      <span style={{
                        ...S.previewPriority,
                        color: { urgent:'#ef4444', normal:'#63b3ed', low:'#22c55e' }[evt.priority] || '#63b3ed'
                      }}>
                        {evt.priority}
                      </span>
                      <span style={S.previewPayload}>
                        {JSON.stringify(evt.payload).slice(0, 70)}...
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const S = {
  page:          { display:'flex', flexDirection:'column', height:'calc(100vh - 52px)', background:'#08080f', fontFamily:'"JetBrains Mono","Fira Code",monospace', padding:'20px 24px', gap:'14px', overflow:'hidden' },
  topBar:        { display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexShrink:0 },
  title:         { fontSize:'14px', fontWeight:'600', color:'#e8e6f0', letterSpacing:'0.04em' },
  sub:           { fontSize:'10px', color:'#3a3a5c', marginTop:'3px', letterSpacing:'0.06em' },
  topRight:      { display:'flex', alignItems:'center', gap:'10px' },
  flash:         { fontSize:'11px', padding:'6px 12px', borderRadius:'5px', letterSpacing:'0.03em' },
  refreshBtn:    { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'5px', color:'#3a3a5c', fontSize:'14px', padding:'4px 10px', cursor:'pointer', fontFamily:'inherit' },
  controls:      { display:'flex', alignItems:'center', gap:'12px', flexShrink:0 },
  search:        { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'5px', padding:'8px 12px', color:'#e8e6f0', fontSize:'11px', outline:'none', fontFamily:'inherit', width:'220px' },
  sortGroup:     { display:'flex', alignItems:'center', gap:'4px' },
  sortLabel:     { fontSize:'9px', color:'#2a2a4e', letterSpacing:'0.1em', textTransform:'uppercase', marginRight:'4px' },
  sortBtn:       { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'4px', color:'#3a3a5c', fontSize:'10px', padding:'4px 10px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em', transition:'all 0.12s' },
  sortBtnActive: { background:'#10102a', border:'1px solid #5b6cf4', color:'#8b9cf4' },
  summaryChips:  { display:'flex', gap:'6px', marginLeft:'auto' },
  chip:          { fontSize:'10px', padding:'3px 10px', borderRadius:'20px', background:'#0d0d1a', border:'1px solid #14142a', color:'#3a3a5c', letterSpacing:'0.04em' },
  list:          { flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px' },
  centerMsg:     { color:'#3a3a5c', fontSize:'11px', letterSpacing:'0.05em', padding:'20px 0' },
  emptyState:    { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'8px' },
  emptyIcon:     { fontSize:'32px', opacity:0.5 },
  emptyTitle:    { fontSize:'12px', color:'#3a3a5c', letterSpacing:'0.05em', fontWeight:'600' },
  emptySub:      { fontSize:'10px', color:'#2a2a4e', letterSpacing:'0.04em' },
  topicCard:     { background:'#0a0a12', border:'1px solid', borderRadius:'8px', overflow:'hidden', transition:'background 0.15s, border-color 0.15s' },
  topicRow:      { display:'flex', alignItems:'center', gap:'16px', padding:'12px 16px' },
  topicLeft:     { display:'flex', alignItems:'center', gap:'8px', minWidth:'200px' },
  topicDot:      { width:'7px', height:'7px', borderRadius:'50%', flexShrink:0, transition:'all 0.2s' },
  topicName:     { fontSize:'12px', color:'#8b9cf4', fontWeight:'600', letterSpacing:'0.03em' },
  subTag:        { fontSize:'9px', color:'#22c55e', background:'#08140a', padding:'2px 7px', borderRadius:'4px', border:'1px solid #22c55e22', letterSpacing:'0.06em' },
  topicMid:      { flex:1, display:'flex', alignItems:'center', gap:'12px' },
  barTrack:      { flex:1, height:'3px', background:'#0e0e1e', borderRadius:'3px', overflow:'hidden' },
  barFill:       { height:'100%', background:'#5b6cf4', borderRadius:'3px', transition:'width 0.4s' },
  countLabel:    { fontSize:'10px', color:'#3a3a5c', letterSpacing:'0.04em', minWidth:'90px', textAlign:'right' },
  topicActions:  { display:'flex', gap:'6px', flexShrink:0 },
  expandBtn:     { background:'none', border:'1px solid #14142a', borderRadius:'4px', color:'#3a3a5c', fontSize:'9px', padding:'4px 10px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.05em', transition:'all 0.12s' },
  subBtn:        { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'4px', color:'#3a3a5c', fontSize:'10px', padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em', transition:'all 0.15s' },
  subBtnActive:  { background:'#08140a', border:'1px solid #22c55e33', color:'#22c55e' },
  previewSection:{ borderTop:'1px solid #0e0e1e', padding:'12px 16px', background:'#08080f' },
  previewTitle:  { fontSize:'9px', color:'#2a2a4e', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' },
  previewEmpty:  { fontSize:'10px', color:'#2a2a4e', letterSpacing:'0.04em', padding:'8px 0' },
  previewRow:    { display:'flex', alignItems:'center', gap:'12px', padding:'5px 0', borderBottom:'1px solid #0a0a12' },
  previewTime:   { fontSize:'9px', color:'#2a2a4e', letterSpacing:'0.04em', minWidth:'70px' },
  previewPriority:{ fontSize:'9px', fontWeight:'600', letterSpacing:'0.06em', minWidth:'50px' },
  previewPayload:{ fontSize:'10px', color:'#3a3a5c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 },
};