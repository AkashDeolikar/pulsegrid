// import { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import config from '../config';

// const S = {
//   page: { minHeight:'100vh', background:'#0a0a0f', color:'#e2e8f0', fontFamily:'monospace', padding:'24px' },
//   header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
//   title: { fontSize:20, fontWeight:700 },
//   refreshBtn: { background:'#5b6cf4', color:'#fff', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer', fontFamily:'inherit' },
//   grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:16, marginBottom:24 },
//   card: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:10, padding:'20px' },
//   cardTitle: { fontSize:14, color:'#4a5568', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.5px' },
//   statusItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e1e2e' },
//   statusLabel: { fontSize:13, color:'#a0aec0' },
//   statusValue: { fontSize:13, fontWeight:500 },
//   statusDot: { width:8, height:8, borderRadius:'50%', marginRight:8 },
//   uptime: { fontSize:24, fontWeight:700, color:'#68d391', marginBottom:8 },
//   uptimeLabel: { fontSize:11, color:'#4a5568' },
//   connections: { display:'flex', flexDirection:'column', gap:8 },
//   connItem: { display:'flex', justifyContent:'space-between', alignItems:'center' },
//   connLabel: { fontSize:12, color:'#a0aec0' },
//   connValue: { fontSize:12, fontWeight:500 },
//   queues: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 },
//   queueCard: { background:'#0f0f15', border:'1px solid #1e1e2e', borderRadius:8, padding:'12px', textAlign:'center' },
//   queueName: { fontSize:11, color:'#4a5568', marginBottom:4, textTransform:'uppercase' },
//   queueCount: { fontSize:18, fontWeight:700 },
//   error: { color:'#fc8181', textAlign:'center', padding:'40px' },
// };

// const StatusIndicator = ({ status, label }) => {
//   const colors = {
//     ok: '#68d391',
//     error: '#fc8181',
//     warning: '#fbbf24',
//   };
//   return (
//     <div style={S.statusItem}>
//       <span style={S.statusLabel}>{label}</span>
//       <div style={{ display:'flex', alignItems:'center' }}>
//         <div style={{ ...S.statusDot, background: colors[status] || '#6b7280' }} />
//         <span style={{ ...S.statusValue, color: colors[status] || '#6b7280' }}>
//           {status === 'ok' ? 'OK' : status === 'error' ? 'ERROR' : status === 'warning' ? 'WARNING' : 'UNKNOWN'}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default function SystemHealth({ token }) {
//   const [health, setHealth] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const fetchHealth = useCallback(async () => {
//     try {
//       const res = await axios.get(`${config.API_BASE}/health`);
//       setHealth(res.data);
//       setLastUpdated(new Date());
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error('[SystemHealth] fetch failed:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchHealth();
//     const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
//     return () => clearInterval(interval);
//   }, [fetchHealth]);

//   if (loading && !health) return <div style={S.page}>Loading system health...</div>;
//   if (error && !health) return <div style={S.page}>Error: {error}</div>;

//   const uptime = health ? new Date() - new Date(health.timestamp) : 0;
//   const uptimeStr = uptime > 0 ? `${Math.floor(uptime / 1000 / 60)}m ${Math.floor((uptime / 1000) % 60)}s` : '—';

//   return (
//     <div style={S.page}>
//       <div style={S.header}>
//         <div>
//           <div style={S.title}>System Health</div>
//           <div style={{ fontSize:11, color:'#4a5568', marginTop:4 }}>
//             Last updated: {lastUpdated?.toLocaleTimeString() || '—'}
//           </div>
//         </div>
//         <button style={S.refreshBtn} onClick={fetchHealth}>↻ Refresh</button>
//       </div>

//       {error && (
//         <div style={{ ...S.card, marginBottom:16, borderColor:'#fc8181' }}>
//           <div style={{ color:'#fc8181', fontSize:13 }}>
//             ⚠️ Connection error: {error}
//           </div>
//         </div>
//       )}

//       <div style={S.grid}>
//         {/* System Status */}
//         <div style={S.card}>
//           <div style={S.cardTitle}>System Status</div>
//           <StatusIndicator status={health?.status === 'ok' ? 'ok' : 'error'} label="Overall Status" />
//           <StatusIndicator status={health?.database === 'connected' ? 'ok' : 'error'} label="Database" />
//           <StatusIndicator status={health?.queues ? 'ok' : 'error'} label="Queue System" />
//         </div>

//         {/* Uptime */}
//         <div style={S.card}>
//           <div style={S.cardTitle}>Uptime</div>
//           <div style={S.uptime}>{uptimeStr}</div>
//           <div style={S.uptimeLabel}>Since last restart</div>
//         </div>

//         {/* Connections */}
//         <div style={S.card}>
//           <div style={S.cardTitle}>Active Connections</div>
//           <div style={S.connections}>
//             <div style={S.connItem}>
//               <span style={S.connLabel}>WebSocket Connections</span>
//               <span style={S.connValue}>{health?.activeConnections || 0}</span>
//             </div>
//             <div style={S.connItem}>
//               <span style={S.connLabel}>Online Users</span>
//               <span style={S.connValue}>{health?.queues ? Object.values(health.queues).reduce((sum, q) => sum + (q.active || 0), 0) : 0}</span>
//             </div>
//           </div>
//         </div>

//         {/* Queue Status */}
//         <div style={{ ...S.card, gridColumn: '1 / -1' }}>
//           <div style={S.cardTitle}>Queue Status</div>
//           <div style={S.queues}>
//             {health?.queues && Object.entries(health.queues).map(([queue, stats]) => (
//               <div key={queue} style={S.queueCard}>
//                 <div style={S.queueName}>{queue}</div>
//                 <div style={{ ...S.queueCount, color: (stats.waiting + stats.active) > 10 ? '#fbbf24' : '#68d391' }}>
//                   {stats.waiting + stats.active}
//                 </div>
//                 <div style={{ fontSize:10, color:'#4a5568', marginTop:2 }}>
//                   {stats.active} active, {stats.waiting} waiting
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }