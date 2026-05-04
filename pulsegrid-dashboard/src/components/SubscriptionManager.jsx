import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

export default function SubscriptionManager({ token }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [topicStats,    setTopicStats]    = useState({});
  const [loading,       setLoading]       = useState(true);
  const [singleTopic,   setSingleTopic]   = useState('');
  const [bulkTopics,    setBulkTopics]    = useState('');
  const [bulkMode,      setBulkMode]      = useState(false);
  const [adding,        setAdding]        = useState(false);
  const [flash,         setFlash]         = useState(null);
  const [search,        setSearch]        = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, topicRes] = await Promise.all([
        axios.get(`${config.API_BASE}/subscriptions/my`,  { headers }),
        axios.get(`${config.API_BASE}/analytics/topics`,  { headers }),
      ]);
      setSubscriptions(subRes.data.subscriptions || []);
      const map = {};
      (topicRes.data.topics || []).forEach(t => { map[t.topic] = t.count; });
      setTopicStats(map);
    } catch (err) {
      console.error('[SubManager]', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSubscribe = async () => {
    const topics = bulkMode
      ? bulkTopics.split(',').map(t => t.trim()).filter(Boolean)
      : [singleTopic.trim()].filter(Boolean);
    if (!topics.length) { showFlash('error', 'Enter at least one topic'); return; }

    setAdding(true);
    try {
      await Promise.all(
        topics.map(t => axios.post(`${config.API_BASE}/subscriptions/subscribe`, { topic:t }, { headers }))
      );
      showFlash('success', `Subscribed to ${topics.length} topic${topics.length > 1 ? 's' : ''}`);
      setSingleTopic(''); setBulkTopics('');
      fetchAll();
    } catch (err) {
      showFlash('error', err.response?.data?.error || 'Failed to subscribe');
    } finally { setAdding(false); }
  };

  const handleUnsubscribe = async (topic) => {
    try {
      await axios.delete(`${config.API_BASE}/subscriptions/unsubscribe`, { headers, data:{ topic } });
      showFlash('success', `Unsubscribed from ${topic}`);
      fetchAll();
    } catch (err) { showFlash('error', 'Failed'); }
  };

  const handleUnsubscribeAll = async () => {
    if (!window.confirm(`Unsubscribe from all ${subscriptions.length} topics?`)) return;
    try {
      await Promise.all(
        subscriptions.map(s =>
          axios.delete(`${config.API_BASE}/subscriptions/unsubscribe`, { headers, data:{ topic: s.topic } })
        )
      );
      showFlash('success', `Unsubscribed from all topics`);
      fetchAll();
    } catch (err) { showFlash('error', 'Failed to unsubscribe all'); }
  };

  const filtered = subscriptions.filter(s =>
    s.topic.toLowerCase().includes(search.toLowerCase())
  );

  const maxCount = Math.max(...Object.values(topicStats), 1);
  const totalEvents = subscriptions.reduce((s, sub) => s + (topicStats[sub.topic] || 0), 0);

  return (
    <div style={S.page}>

      {/* ── SIDEBAR ── */}
      <div style={S.sidebar}>
        <div style={S.sideTitle}>Add Subscriptions</div>

        {/* Single / Bulk toggle */}
        <div style={S.toggle}>
          <button style={{...S.toggleBtn,...(!bulkMode?S.toggleActive:{})}} onClick={() => setBulkMode(false)}>Single</button>
          <button style={{...S.toggleBtn,...( bulkMode?S.toggleActive:{})}} onClick={() => setBulkMode(true)} >Bulk</button>
        </div>

        {bulkMode ? (
          <>
            <label style={S.fieldLabel}>Topics (comma-separated)</label>
            <textarea
              style={S.textarea}
              value={bulkTopics}
              onChange={e => setBulkTopics(e.target.value)}
              placeholder={'orders, payments,\nalerts, analytics'}
              rows={4}
            />
            <div style={S.hint}>
              {bulkTopics.split(',').filter(t=>t.trim()).length} topics entered
            </div>
          </>
        ) : (
          <>
            <label style={S.fieldLabel}>Topic name</label>
            <input
              style={S.input}
              type="text"
              value={singleTopic}
              onChange={e => setSingleTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
              placeholder="orders"
              autoFocus
            />
          </>
        )}

        <button
          style={{...S.addBtn, opacity: adding?0.6:1}}
          onClick={handleSubscribe}
          disabled={adding}
        >
          {adding ? 'Subscribing...' : '+ Subscribe'}
        </button>

        {flash && (
          <div style={{
            ...S.flashMsg,
            background: flash.type==='success' ? '#08140a' : '#140808',
            borderColor: flash.type==='success' ? '#22c55e33' : '#ef444433',
            color: flash.type==='success' ? '#22c55e' : '#ef4444',
          }}>
            {flash.text}
          </div>
        )}

        {/* Summary stats */}
        <div style={S.statsCard}>
          {[
            ['Active subscriptions', subscriptions.length],
            ['Total events received', totalEvents.toLocaleString()],
          ].map(([label, val]) => (
            <div key={label} style={S.statRow}>
              <span style={S.statLabel}>{label}</span>
              <span style={S.statVal}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={S.main}>

        {/* Main header */}
        <div style={S.mainHead}>
          <div>
            <div style={S.pageTitle}>My Subscriptions</div>
            <div style={S.pageSub}>{filtered.length} of {subscriptions.length} shown</div>
          </div>
          <div style={S.headActions}>
            <input
              style={S.searchInput}
              type="text"
              placeholder="Filter topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {subscriptions.length > 0 && (
              <button style={S.dangerBtn} onClick={handleUnsubscribeAll}>
                Unsubscribe all
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={S.centerMsg}>Loading subscriptions...</div>
        ) : filtered.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>📭</div>
            <div style={S.emptyTitle}>{subscriptions.length === 0 ? 'No subscriptions yet' : 'No matches found'}</div>
            <div style={S.emptySub}>
              {subscriptions.length === 0
                ? 'Add a topic on the left to start receiving events'
                : 'Try a different filter'}
            </div>
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map(sub => {
              const count = topicStats[sub.topic] || 0;
              const barW  = Math.min(100, (count / maxCount) * 100);
              return (
                <div key={sub.topic} style={S.card}>
                  <div style={S.cardTop}>
                    <div style={S.dot} />
                    <span style={S.topicName}>{sub.topic}</span>
                    <button
                      style={S.unsubBtn}
                      onClick={() => handleUnsubscribe(sub.topic)}
                    >
                      Unsubscribe
                    </button>
                  </div>
                  <div style={S.cardMid}>
                    <span style={S.cardSince}>
                      Since {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                    <span style={S.cardCount}>
                      {count > 0 ? `${count.toLocaleString()} events` : 'No events yet'}
                    </span>
                  </div>
                  <div style={S.barTrack}>
                    <div style={{...S.barFill, width:`${barW}%`}} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page:       {display:'grid',gridTemplateColumns:'280px 1fr',gap:'1px',height:'calc(100vh - 56px)',background:'#14142a',fontFamily:'"JetBrains Mono","Fira Code",monospace',overflow:'hidden'},
  sidebar:    {background:'#08080f',padding:'20px',display:'flex',flexDirection:'column',gap:'0',overflowY:'auto'},
  sideTitle:  {fontSize:'11px',fontWeight:'600',color:'#3a3a5c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'16px'},
  toggle:     {display:'flex',background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'6px',padding:'3px',marginBottom:'14px'},
  toggleBtn:  {flex:1,background:'none',border:'none',color:'#3a3a5c',fontSize:'11px',padding:'5px',cursor:'pointer',borderRadius:'4px',fontFamily:'inherit',letterSpacing:'0.04em',transition:'all 0.15s'},
  toggleActive:{background:'#10102a',color:'#8b9cf4'},
  fieldLabel: {fontSize:'10px',color:'#3a3a5c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'6px',display:'block'},
  input:      {width:'100%',background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'5px',padding:'9px 12px',color:'#e8e6f0',fontSize:'11px',outline:'none',fontFamily:'inherit'},
  textarea:   {width:'100%',background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'5px',padding:'9px 12px',color:'#e8e6f0',fontSize:'11px',outline:'none',fontFamily:'inherit',resize:'vertical',lineHeight:'1.6'},
  hint:       {fontSize:'9px',color:'#3a3a5c',letterSpacing:'0.05em',marginTop:'4px',marginBottom:'8px'},
  addBtn:     {width:'100%',background:'#5b6cf4',border:'none',borderRadius:'6px',padding:'10px',color:'#fff',fontSize:'11px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.04em',marginTop:'10px',boxShadow:'0 4px 16px #5b6cf422',transition:'opacity 0.15s'},
  flashMsg:   {marginTop:'10px',padding:'8px 10px',borderRadius:'5px',fontSize:'11px',letterSpacing:'0.03em',border:'1px solid'},
  statsCard:  {marginTop:'auto',paddingTop:'16px',borderTop:'1px solid #0e0e1e'},
  statRow:    {display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #0a0a14'},
  statLabel:  {fontSize:'10px',color:'#2a2a4e',letterSpacing:'0.05em'},
  statVal:    {fontSize:'12px',color:'#8b9cf4',fontWeight:'600'},
  main:       {background:'#08080f',padding:'20px',display:'flex',flexDirection:'column',gap:'16px',overflow:'hidden'},
  mainHead:   {display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexShrink:0},
  pageTitle:  {fontSize:'14px',fontWeight:'600',color:'#e8e6f0',letterSpacing:'0.04em'},
  pageSub:    {fontSize:'10px',color:'#3a3a5c',marginTop:'3px',letterSpacing:'0.06em'},
  headActions:{display:'flex',gap:'8px',alignItems:'center'},
  searchInput:{background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'5px',padding:'7px 12px',color:'#e8e6f0',fontSize:'11px',outline:'none',fontFamily:'inherit',width:'180px'},
  dangerBtn:  {background:'#1a0808',border:'1px solid #2a1010',borderRadius:'5px',color:'#ef4444',fontSize:'10px',padding:'6px 12px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.04em'},
  centerMsg:  {color:'#3a3a5c',fontSize:'11px',letterSpacing:'0.05em',padding:'20px 0'},
  emptyState: {display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:'8px',color:'#2a2a4e'},
  emptyIcon:  {fontSize:'32px',opacity:0.5},
  emptyTitle: {fontSize:'12px',color:'#3a3a5c',letterSpacing:'0.05em',fontWeight:'600'},
  emptySub:   {fontSize:'10px',color:'#2a2a4e',letterSpacing:'0.04em',textAlign:'center'},
  grid:       {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'10px',overflowY:'auto',flex:1},
  card:       {background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'8px',padding:'14px 16px'},
  cardTop:    {display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'},
  dot:        {width:'6px',height:'6px',borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 5px #22c55e88',flexShrink:0},
  topicName:  {flex:1,fontSize:'12px',color:'#8b9cf4',fontWeight:'600',letterSpacing:'0.03em'},
  unsubBtn:   {background:'none',border:'1px solid #1a1a2e',borderRadius:'4px',color:'#3a3a5c',fontSize:'9px',padding:'3px 8px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.05em'},
  cardMid:    {display:'flex',justifyContent:'space-between',alignItems:'center'},
  cardSince:  {fontSize:'9px',color:'#2a2a4e',letterSpacing:'0.04em'},
  cardCount:  {fontSize:'10px',color:'#5b6cf4',letterSpacing:'0.04em'},
  barTrack:   {marginTop:'10px',height:'2px',background:'#0e0e1e',borderRadius:'2px',overflow:'hidden'},
  barFill:    {height:'100%',background:'#5b6cf4',borderRadius:'2px',transition:'width 0.4s'},
};