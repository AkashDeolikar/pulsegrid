// import { useMemo } from 'react';
// import { useAnalytics } from '../hooks/useAnalytics';
// import { useAnomalySocket } from '../hooks/useAnomalysocket';
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip,
//   BarChart, Bar, ResponsiveContainer, CartesianGrid,
// } from 'recharts';

// const S = {
//   page: { minHeight:'100vh', background:'#0a0a0f', color:'#e2e8f0', fontFamily:'monospace', padding:'24px' },
//   header: { display:'flex', justifyContent:'space-between', marginBottom:24 },
//   title: { fontSize:20, fontWeight:700 },
//   meta: { fontSize:11, color:'#4a5568' },
//   grid4: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
//   grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 },
//   card: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:10, padding:'16px' },
//   cardTitle: { fontSize:11, color:'#4a5568', marginBottom:10 },
//   bigNum: { fontSize:28, fontWeight:700 },
// };

// const StatCard = ({ label, value }) => (
//   <div style={S.card}>
//     <div style={S.cardTitle}>{label}</div>
//     <div style={S.bigNum}>{value ?? '—'}</div>
//   </div>
// );

// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background:'#111', padding:8, borderRadius:6 }}>
//       <div>{label}</div>
//       <div>{payload[0].value} events</div>
//     </div>
//   );
// };

// export default function Dashboard({ token, onLogout }) {
//   const { data, loading, error, lastUpdated } = useAnalytics(token);
//   const { alerts, wsStatus } = useAnomalySocket(token);

//   // 🔥 UNIVERSAL THROUGHPUT FIX
//   const throughputData = useMemo(() => {
//     const raw = data?.throughput;

//     if (!raw) return [];

//     let arr = [];

//     if (Array.isArray(raw)) arr = raw;
//     else if (Array.isArray(raw.throughput)) arr = raw.throughput;
//     else if (Array.isArray(raw.data)) arr = raw.data;

//     return arr.map(d => ({
//       time:
//         d.time ||
//         (d.timestamp
//           ? new Date(d.timestamp).toLocaleTimeString()
//           : ''),
//       value:
//         typeof d.value === 'number'
//           ? d.value
//           : typeof d.count === 'number'
//           ? d.count
//           : 0,
//     }));
//   }, [data]);

//   if (loading) return <div style={S.page}>Loading...</div>;
//   if (error) return <div style={S.page}>Error: {error}</div>;

//   const overview = data?.overview || {};
//   const latency = data?.latency || {};
//   const topicsData = data?.topics?.topics || [];
//   const priorityData = overview?.priority || [];

//   return (
//     <div style={S.page}>

//       {/* HEADER */}
//       <div style={S.header}>
//         <div>
//           <div style={S.title}>⚡ PulseGrid</div>
//           <div style={S.meta}>
//             {wsStatus === 'connected' ? '● live' : '○ reconnecting'}
//           </div>
//         </div>

//         <div>
//           <div style={S.meta}>
//             Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
//           </div>
//           <button onClick={onLogout}>Sign out</button>
//         </div>
//       </div>

//       {/* STATS */}
//       <div style={S.grid4}>
//         <StatCard label="Total Events" value={overview?.events?.total} />
//         <StatCard label="Processed" value={overview?.events?.processed} />
//         <StatCard label="Failed" value={overview?.events?.failed} />
//         <StatCard label="Active Topics" value={topicsData.length} />
//       </div>

//       {/* THROUGHPUT */}
//       <div style={S.card}>
//         <div style={S.cardTitle}>Throughput</div>

//         {throughputData.length === 0 ? (
//           <div>No throughput data</div>
//         ) : (
//           <ResponsiveContainer width="100%" height={250}>
//             <AreaChart data={throughputData}>
//               <CartesianGrid stroke="#1e1e2e" />
//               <XAxis dataKey="time" />
//               <YAxis />
//               <Tooltip content={<CustomTooltip />} />
//               <Area
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#63b3ed"
//                 fill="#63b3ed33"
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         )}
//       </div>

//       {/* LATENCY + PRIORITY */}
//       <div style={S.grid2}>

//         <div style={S.card}>
//           <div style={S.cardTitle}>Latency</div>
//           <div>P50: {latency?.p50 ?? 0} ms</div>
//           <div>P95: {latency?.p95 ?? 0} ms</div>
//           <div>P99: {latency?.p99 ?? 0} ms</div>
//         </div>

//         <div style={S.card}>
//           <div style={S.cardTitle}>Priority</div>
//           <ResponsiveContainer width="100%" height={200}>
//             <BarChart data={priorityData}>
//               <CartesianGrid stroke="#1e1e2e" />
//               <XAxis dataKey="priority" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="count" fill="#68d391" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//       </div>

//       {/* TOPICS + ALERTS */}
//       <div style={S.grid2}>

//         <div style={S.card}>
//           <div style={S.cardTitle}>Top Topics</div>
//           {topicsData.length === 0 ? (
//             <div>No data</div>
//           ) : (
//             topicsData.slice(0,5).map((t, i) => (
//               <div key={i}>
//                 {t.topic} — {t.count}
//               </div>
//             ))
//           )}
//         </div>

//         <div style={S.card}>
//           <div style={S.cardTitle}>Live Alerts ({alerts.length})</div>
//           {alerts.length === 0 ? (
//             <div>No anomalies</div>
//           ) : (
//             alerts.map((a, i) => (
//               <div key={i}>
//                 <strong>{a.topic}</strong> — Z={a.zScore}
//               </div>
//             ))
//           )}
//         </div>

//       </div>

//     </div>
//   );
// }


import { useAnalytics }      from '../hooks/useAnalytics';
import { useAnomalySocket }     from '../hooks/useAnomalysocket';
import { AnimatedCounter, Sparkline, Badge, Spinner, EmptyState } from './UI';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── SLA threshold: warn if P99 > 200ms ──────────────────────────
const P99_SLA_MS = 200;

export default function Dashboard({ token, onLogout }) {
  const { data, loading, error, lastUpdated, refresh } = useAnalytics(token);
  const { alerts, wsStatus } = useAnomalySocket(token);

  if (loading) return <DashboardSkeleton />;

  if (error) return (
    <div style={S.page}>
      <EmptyState
        icon="⚠"
        title="Failed to load analytics"
        sub={error}
        action={
          <button style={S.retryBtn} onClick={refresh}>
            ↻ Try again
          </button>
        }
      />
    </div>
  );

  const { overview, throughput, latency, topics } = data || {};
  const ev      = overview?.events    || {};
  const conns   = overview?.connections || {};
  const queues  = overview?.queues    || {};
  const prio    = overview?.priority  || [];
  const tData   = throughput?.throughput || [];
  const topicList = topics?.topics    || [];
  const critCount = alerts.filter(a => a.severity === 'critical').length;

  // SLA tracking
  const p99       = latency?.p99 || 0;
  const slaOk     = p99 <= P99_SLA_MS;
  const slaColor  = slaOk ? '#22c55e' : '#ef4444';

  // Delivery rate
  const total     = parseInt(ev.total)     || 0;
  const delivered = parseInt(ev.delivered) || 0;
  const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

  // Throughput sparkline data (last 10 points)
  const sparkData = tData.slice(-10).map(d => d.count);

  // Total queue depth
  const queueDepth = ['urgent','normal','low'].reduce((s, q) =>
    s + (queues[q]?.waiting || 0) + (queues[q]?.active || 0), 0
  );

  const wsConf = {
    connected:    { color:'#22c55e', label:'● live'       },
    connecting:   { color:'#f59e0b', label:'◌ connecting' },
    disconnected: { color:'#ef4444', label:'○ offline'    },
  }[wsStatus] || { color:'#ef4444', label:'○ offline' };

  return (
    <div style={S.page}>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div>
          <div style={S.pageTitle}>Analytics</div>
          <div style={S.pageSub}>
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'} · auto-refreshes every 10s
          </div>
        </div>
        <div style={S.headerRight}>
          <span style={{ ...S.wsBadge, color: wsConf.color }}>
            <span style={{ ...S.wsDot, background: wsConf.color, boxShadow:`0 0 5px ${wsConf.color}` }} />
            {wsConf.label}
          </span>
          <button style={S.refreshBtn} onClick={refresh} title="Refresh now">↻</button>
        </div>
      </div>

      {/* ── CRITICAL ANOMALY BANNER ── */}
      {critCount > 0 && (
        <div style={S.anomalyBanner}>
          <span style={S.bannerIcon}>🚨</span>
          <div>
            <div style={S.bannerTitle}>{critCount} Critical Anomaly{critCount > 1 ? 'ies' : ''} Detected</div>
            <div style={S.bannerSub}>Traffic spike detected — Z-score exceeds 3.0 standard deviations</div>
          </div>
          <Badge preset="critical" style={{ marginLeft:'auto' }}>CRITICAL</Badge>
        </div>
      )}

      {/* ── SLA BANNER ── */}
      {!slaOk && (
        <div style={{ ...S.anomalyBanner, borderColor:'#f59e0b33', background:'#140e08' }}>
          <span style={S.bannerIcon}>⚠</span>
          <div>
            <div style={{ ...S.bannerTitle, color:'#f59e0b' }}>SLA Breach — P99 Latency</div>
            <div style={S.bannerSub}>P99 is {p99}ms · exceeds {P99_SLA_MS}ms SLA threshold</div>
          </div>
          <Badge preset="warning" style={{ marginLeft:'auto' }}>SLA BREACH</Badge>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div style={S.statGrid}>
        <StatCard
          label="Total Events"
          value={total}
          sub={`${delivered.toLocaleString()} delivered`}
          color="#63b3ed"
          sparkData={sparkData}
          sparkColor="#63b3ed"
        />
        <StatCard
          label="Delivery Rate"
          value={deliveryRate}
          format={v => `${v}%`}
          sub={`${ev.failed || 0} failed`}
          color={deliveryRate >= 99 ? '#22c55e' : deliveryRate >= 95 ? '#f59e0b' : '#ef4444'}
        />
        <StatCard
          label="Active Connections"
          value={conns.active || 0}
          sub="WebSocket sessions"
          color="#22c55e"
        />
        <StatCard
          label="Queue Depth"
          value={queueDepth}
          sub="jobs pending"
          color={queueDepth > 100 ? '#f59e0b' : '#8b9cf4'}
        />
        <StatCard
          label="P99 Latency"
          value={p99}
          format={v => `${v}ms`}
          sub={slaOk ? `within ${P99_SLA_MS}ms SLA` : `SLA breach`}
          color={slaColor}
        />
      </div>

      {/* ── THROUGHPUT CHART ── */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>Events / minute — last 30 min</span>
          <span style={S.cardMeta}>
            peak: {throughput?.peak || 0} · avg: {throughput?.avg || 0}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={tData} margin={{ top:4, right:4, left:-24, bottom:0 }}>
            <defs>
              <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#5b6cf4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#5b6cf4" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0e0e1e" />
            <XAxis
              dataKey="minute"
              tickFormatter={v => new Date(v).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
              tick={{ fill:'#3a3a5c', fontSize:9, fontFamily:'monospace' }}
              interval={4}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill:'#3a3a5c', fontSize:9, fontFamily:'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#5b6cf4" strokeWidth={2} fill="url(#tGrad)" dot={false} activeDot={{ r:4, fill:'#5b6cf4' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={S.bottomRow}>

        {/* Latency */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Delivery Latency</span></div>
          {[
            { label:'P50 (median)', value: latency?.p50 || 0, color:'#22c55e', sla: P99_SLA_MS },
            { label:'P95',          value: latency?.p95 || 0, color:'#f59e0b', sla: P99_SLA_MS },
            { label:'P99',          value: latency?.p99 || 0, color: slaColor,  sla: P99_SLA_MS },
          ].map(({ label, value, color }) => (
            <div key={label} style={S.latRow}>
              <span style={S.latLabel}>{label}</span>
              <div style={{ flex:1, margin:'0 12px' }}>
                <div style={S.latBar}>
                  <div style={{ ...S.latBarFill, width:`${Math.min(100, (value / P99_SLA_MS) * 100)}%`, background: color }} />
                </div>
              </div>
              <span style={{ ...S.latVal, color }}>{value}ms</span>
            </div>
          ))}
          <div style={S.slaRow}>
            <span style={S.slaLabel}>SLA target: {P99_SLA_MS}ms P99</span>
            <Badge preset={slaOk ? 'success' : 'failed'}>{slaOk ? '✓ Within SLA' : '✗ SLA Breach'}</Badge>
          </div>
          <div style={S.latSamples}>{latency?.samples || 0} samples</div>
        </div>

        {/* Priority breakdown */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Priority Breakdown</span></div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={prio} margin={{ top:4, right:4, left:-24, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0e0e1e" />
              <XAxis dataKey="priority" tick={{ fill:'#3a3a5c', fontSize:9, fontFamily:'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#3a3a5c', fontSize:9, fontFamily:'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'6px', fontSize:'11px', fontFamily:'monospace' }}
                labelStyle={{ color:'#5a5a7a' }}
                cursor={{ fill:'#14142a' }}
              />
              <Bar dataKey="count" radius={[3,3,0,0]} fill="#5b6cf4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Queue status */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Queue Status</span></div>
          {['urgent','normal','low'].map(q => {
            const qd   = queues[q] || {};
            const depth = (qd.waiting||0) + (qd.active||0);
            const qColor = { urgent:'#ef4444', normal:'#5b6cf4', low:'#22c55e' }[q];
            return (
              <div key={q} style={S.queueRow}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:'70px' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:qColor, boxShadow:`0 0 5px ${qColor}` }} />
                  <span style={{ fontSize:'10px', color:qColor, fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em' }}>{q}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ ...S.latBar, margin:'0 8px' }}>
                    <div style={{ ...S.latBarFill, width:`${Math.min(100, depth * 2)}%`, background:qColor }} />
                  </div>
                </div>
                <div style={S.qStats}>
                  <span style={{ color: depth > 0 ? qColor : '#3a3a5c', fontWeight: depth > 0 ? '600' : '400' }}>
                    {depth} pending
                  </span>
                  <span style={{ color:'#22c55e', fontSize:'9px' }}>{qd.completed||0} done</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top topics */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>Top Topics</span></div>
          {topicList.length === 0 ? (
            <EmptyState icon="📭" title="No topics yet" sub="Publish events to see data" style={{ padding:'16px 0' }} />
          ) : (
            topicList.slice(0,6).map((t, i) => {
              const max = topicList[0]?.count || 1;
              return (
                <div key={t.topic} style={S.topicRow}>
                  <span style={S.topicRank}>{i+1}</span>
                  <span style={S.topicName}>{t.topic}</span>
                  <div style={{ flex:1, margin:'0 8px' }}>
                    <div style={S.latBar}>
                      <div style={{ ...S.latBarFill, width:`${(t.count/max)*100}%`, background:'#5b6cf4' }} />
                    </div>
                  </div>
                  <span style={S.topicCount}>{t.count.toLocaleString()}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function StatCard({ label, value, format, sub, color, sparkData, sparkColor }) {
  return (
    <div style={SC.card}>
      <div style={SC.label}>{label}</div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <AnimatedCounter
          value={value || 0}
          format={format}
          style={{ fontSize:'28px', fontWeight:'700', color, lineHeight:1 }}
        />
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} width={64} height={28} color={sparkColor || color} />
        )}
      </div>
      {sub && <div style={SC.sub}>{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'6px', padding:'8px 12px', fontSize:'11px', fontFamily:'monospace' }}>
      <div style={{ color:'#3a3a5c', marginBottom:'4px' }}>
        {new Date(label).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
      </div>
      <div style={{ color:'#5b6cf4', fontWeight:'600' }}>{payload[0].value} events/min</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={S.page}>
      <div style={S.statGrid}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ ...SK.card }}>
            <div style={{ ...SK.line, width:'60%', marginBottom:'10px' }} />
            <div style={{ ...SK.line, width:'40%', height:'28px', marginBottom:'6px' }} />
            <div style={{ ...SK.line, width:'50%' }} />
          </div>
        ))}
      </div>
      <div style={{ ...SK.card, height:'200px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Spinner size={24} />
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const S = {
  page:        { display:'flex', flexDirection:'column', height:'calc(100vh - 52px)', background:'#08080f', fontFamily:'"JetBrains Mono","Fira Code",monospace', padding:'18px 22px', gap:'12px', overflow:'auto' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexShrink:0 },
  pageTitle:   { fontSize:'14px', fontWeight:'600', color:'#e8e6f0', letterSpacing:'0.04em' },
  pageSub:     { fontSize:'10px', color:'#3a3a5c', marginTop:'3px', letterSpacing:'0.06em' },
  headerRight: { display:'flex', alignItems:'center', gap:'10px' },
  wsBadge:     { display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', fontWeight:'500', letterSpacing:'0.05em' },
  wsDot:       { width:'6px', height:'6px', borderRadius:'50%', flexShrink:0 },
  refreshBtn:  { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'5px', color:'#3a3a5c', fontSize:'14px', padding:'4px 10px', cursor:'pointer', fontFamily:'inherit' },
  retryBtn:    { background:'#5b6cf4', border:'none', borderRadius:'5px', color:'#fff', fontSize:'11px', padding:'8px 16px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em' },
  anomalyBanner:{ display:'flex', alignItems:'center', gap:'12px', background:'#140808', border:'1px solid #ef444433', borderRadius:'8px', padding:'12px 16px', flexShrink:0 },
  bannerIcon:  { fontSize:'18px', flexShrink:0 },
  bannerTitle: { fontSize:'12px', fontWeight:'600', color:'#ef4444', marginBottom:'2px', letterSpacing:'0.03em' },
  bannerSub:   { fontSize:'10px', color:'#4a2a2a', letterSpacing:'0.03em' },
  statGrid:    { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', flexShrink:0 },
  card:        { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'8px', padding:'14px 16px', flexShrink:0 },
  cardHead:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' },
  cardTitle:   { fontSize:'10px', fontWeight:'600', color:'#3a3a5c', textTransform:'uppercase', letterSpacing:'0.1em' },
  cardMeta:    { fontSize:'9px', color:'#2a2a4e', letterSpacing:'0.05em' },
  bottomRow:   { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'10px', flex:1 },
  latRow:      { display:'flex', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #0a0a14' },
  latLabel:    { fontSize:'10px', color:'#3a3a5c', minWidth:'90px', letterSpacing:'0.04em' },
  latBar:      { height:'3px', background:'#0e0e1e', borderRadius:'2px', overflow:'hidden', flex:1 },
  latBarFill:  { height:'100%', borderRadius:'2px', transition:'width 0.4s ease' },
  latVal:      { fontSize:'13px', fontWeight:'600', minWidth:'50px', textAlign:'right', letterSpacing:'0.03em' },
  latSamples:  { fontSize:'9px', color:'#2a2a4e', marginTop:'8px', letterSpacing:'0.05em' },
  slaRow:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px', paddingTop:'10px', borderTop:'1px solid #0a0a14' },
  slaLabel:    { fontSize:'9px', color:'#2a2a4e', letterSpacing:'0.05em' },
  queueRow:    { display:'flex', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #0a0a14' },
  qStats:      { display:'flex', flexDirection:'column', gap:'2px', minWidth:'80px', textAlign:'right', fontSize:'10px', color:'#3a3a5c', letterSpacing:'0.04em' },
  topicRow:    { display:'flex', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #0a0a14' },
  topicRank:   { fontSize:'9px', color:'#2a2a4e', minWidth:'16px', letterSpacing:'0.05em' },
  topicName:   { fontSize:'10px', color:'#8b9cf4', fontWeight:'500', minWidth:'80px', letterSpacing:'0.03em' },
  topicCount:  { fontSize:'10px', color:'#3a3a5c', minWidth:'40px', textAlign:'right', letterSpacing:'0.04em' },
};

const SC = {
  card:  { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'8px', padding:'14px 16px' },
  label: { fontSize:'10px', fontWeight:'600', color:'#3a3a5c', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' },
  sub:   { fontSize:'10px', color:'#2a2a4e', marginTop:'5px', letterSpacing:'0.04em' },
};

const SK = {
  card: { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'8px', padding:'14px 16px' },
  line: { background:'linear-gradient(90deg,#0d0d1a 25%,#14142a 50%,#0d0d1a 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite', borderRadius:'3px', height:'11px', marginBottom:'4px' },
};