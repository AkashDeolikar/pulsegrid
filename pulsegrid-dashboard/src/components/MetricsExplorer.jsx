// import { useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios';
// import config from '../config';
// import {
//   LineChart, Line, AreaChart, Area, BarChart, Bar,
//   XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
//   PieChart, Pie, Cell,
// } from 'recharts';

// const S = {
//   page: { minHeight:'100vh', background:'#0a0a0f', color:'#e2e8f0', fontFamily:'monospace', padding:'24px' },
//   header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
//   title: { fontSize:20, fontWeight:700 },
//   controls: { display:'flex', gap:12, alignItems:'center' },
//   select: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:6, padding:'8px 12px', color:'#e2e8f0', fontFamily:'inherit', fontSize:12 },
//   refreshBtn: { background:'#5b6cf4', color:'#fff', border:'none', padding:'8px 16px', borderRadius:6, cursor:'pointer', fontFamily:'inherit' },
//   grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:16, marginBottom:24 },
//   card: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:10, padding:'20px' },
//   cardTitle: { fontSize:14, color:'#4a5568', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.5px' },
//   chartContainer: { height:300, marginBottom:16 },
//   stats: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:16 },
//   statCard: { background:'#0f0f15', border:'1px solid #1e1e2e', borderRadius:8, padding:'12px', textAlign:'center' },
//   statValue: { fontSize:18, fontWeight:700, color:'#68d391' },
//   statLabel: { fontSize:10, color:'#4a5568', textTransform:'uppercase', letterSpacing:'0.5px' },
//   tabs: { display:'flex', gap:2, marginBottom:16 },
//   tab: { background:'transparent', border:'1px solid #1e1e2e', borderRadius:6, padding:'8px 16px', color:'#4a5568', cursor:'pointer', fontFamily:'inherit', fontSize:12 },
//   tabActive: { background:'#5b6cf4', color:'#fff', borderColor:'#5b6cf4' },
//   exportBtn: { background:'#22c55e', color:'#fff', border:'none', padding:'6px 12px', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontSize:11 },
// };

// const TIME_RANGES = [
//   { label: '5 minutes', value: 5 },
//   { label: '15 minutes', value: 15 },
//   { label: '1 hour', value: 60 },
//   { label: '6 hours', value: 360 },
//   { label: '24 hours', value: 1440 },
// ];

// const CustomTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background:'#111', padding:8, borderRadius:6, border:'1px solid #333' }}>
//       <div style={{ color:'#e2e8f0', marginBottom:4 }}>{label}</div>
//       {payload.map((entry, index) => (
//         <div key={index} style={{ color: entry.color, fontSize:12 }}>
//           {entry.name}: {entry.value}
//         </div>
//       ))}
//     </div>
//   );
// };

// const COLORS = ['#5b6cf4', '#68d391', '#fbbf24', '#fc8181', '#a78bfa'];

// export default function MetricsExplorer({ token }) {
//   const [activeTab, setActiveTab] = useState('throughput');
//   const [timeRange, setTimeRange] = useState(60);
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const headers = { Authorization: `Bearer ${token}` };

//   const fetchMetrics = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [throughput, latency, topics, overview] = await Promise.all([
//         axios.get(`${config.API_BASE}/analytics/throughput?minutes=${timeRange}`, { headers }),
//         axios.get(`${config.API_BASE}/analytics/latency`, { headers }),
//         axios.get(`${config.API_BASE}/analytics/topics`, { headers }),
//         axios.get(`${config.API_BASE}/analytics/overview`, { headers }),
//       ]);

//       setData({
//         throughput: throughput.data,
//         latency: latency.data,
//         topics: topics.data,
//         overview: overview.data,
//       });
//       setLastUpdated(new Date());
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error('[MetricsExplorer] fetch failed:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, timeRange]);

//   useEffect(() => {
//     fetchMetrics();
//   }, [fetchMetrics]);

//   const exportData = () => {
//     const exportData = {
//       timestamp: new Date().toISOString(),
//       timeRange: `${timeRange} minutes`,
//       data,
//     };
//     const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `pulsegrid-metrics-${new Date().toISOString().split('T')[0]}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const throughputChartData = useMemo(() => {
//     if (!data.throughput?.throughput) return [];
//     return data.throughput.throughput.map(point => ({
//       time: point.minute ? new Date(point.minute * 60000).toLocaleTimeString() : point.time || '',
//       events: point.count || 0,
//     }));
//   }, [data.throughput]);

//   const topicsChartData = useMemo(() => {
//     if (!data.topics?.topics) return [];
//     return data.topics.topics.map((topic, index) => ({
//       name: topic.topic,
//       value: topic.count,
//       fill: COLORS[index % COLORS.length],
//     }));
//   }, [data.topics]);

//   const priorityChartData = useMemo(() => {
//     if (!data.overview?.priority) return [];
//     return data.overview.priority.map(p => ({
//       priority: p.priority,
//       count: p.count,
//     }));
//   }, [data.overview]);

//   if (loading) return <div style={S.page}>Loading metrics...</div>;
//   if (error) return <div style={S.page}>Error: {error}</div>;

//   return (
//     <div style={S.page}>
//       <div style={S.header}>
//         <div>
//           <div style={S.title}>Metrics Explorer</div>
//           <div style={{ fontSize:11, color:'#4a5568', marginTop:4 }}>
//             Last updated: {lastUpdated?.toLocaleTimeString() || '—'}
//           </div>
//         </div>
//         <div style={S.controls}>
//           <select
//             style={S.select}
//             value={timeRange}
//             onChange={e => setTimeRange(parseInt(e.target.value))}
//           >
//             {TIME_RANGES.map(range => (
//               <option key={range.value} value={range.value}>{range.label}</option>
//             ))}
//           </select>
//           <button style={S.refreshBtn} onClick={fetchMetrics}>↻ Refresh</button>
//           <button style={S.exportBtn} onClick={exportData}>📥 Export</button>
//         </div>
//       </div>

//       {/* Summary Stats */}
//       <div style={S.stats}>
//         <div style={S.statCard}>
//           <div style={S.statValue}>{data.throughput?.total || 0}</div>
//           <div style={S.statLabel}>Total Events</div>
//         </div>
//         <div style={S.statCard}>
//           <div style={S.statValue}>{data.throughput?.peak || 0}</div>
//           <div style={S.statLabel}>Peak Throughput</div>
//         </div>
//         <div style={S.statCard}>
//           <div style={S.statValue}>{data.latency?.p95 || 0}ms</div>
//           <div style={S.statLabel}>P95 Latency</div>
//         </div>
//         <div style={S.statCard}>
//           <div style={S.statValue}>{data.topics?.topics?.length || 0}</div>
//           <div style={S.statLabel}>Active Topics</div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div style={S.tabs}>
//         {[
//           { id: 'throughput', label: 'Throughput' },
//           { id: 'latency', label: 'Latency' },
//           { id: 'topics', label: 'Topics' },
//           { id: 'priority', label: 'Priority' },
//         ].map(tab => (
//           <button
//             key={tab.id}
//             style={{ ...S.tab, ...(activeTab === tab.id ? S.tabActive : {}) }}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Charts */}
//       <div style={S.grid}>
//         {activeTab === 'throughput' && (
//           <div style={{ ...S.card, gridColumn: '1 / -1' }}>
//             <div style={S.cardTitle}>Event Throughput</div>
//             <div style={S.chartContainer}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={throughputChartData}>
//                   <CartesianGrid stroke="#1e1e2e" />
//                   <XAxis dataKey="time" />
//                   <YAxis />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Area
//                     type="monotone"
//                     dataKey="events"
//                     stroke="#5b6cf4"
//                     fill="#5b6cf433"
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {activeTab === 'latency' && (
//           <div style={S.card}>
//             <div style={S.cardTitle}>Latency Distribution</div>
//             <div style={{ padding: '20px', textAlign: 'center' }}>
//               <div style={{ fontSize: 32, fontWeight: 700, color: '#68d391', marginBottom: 8 }}>
//                 {data.latency?.p50 || 0}ms
//               </div>
//               <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 16 }}>P50 Latency</div>

//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//                 <div>
//                   <div style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>
//                     {data.latency?.p95 || 0}ms
//                   </div>
//                   <div style={{ fontSize: 10, color: '#4a5568' }}>P95</div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: 18, fontWeight: 700, color: '#fc8181' }}>
//                     {data.latency?.p99 || 0}ms
//                   </div>
//                   <div style={{ fontSize: 10, color: '#4a5568' }}>P99</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'topics' && (
//           <div style={S.card}>
//             <div style={S.cardTitle}>Topics Distribution</div>
//             <div style={S.chartContainer}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={topicsChartData}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {topicsChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.fill} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}

//         {activeTab === 'priority' && (
//           <div style={S.card}>
//             <div style={S.cardTitle}>Priority Distribution</div>
//             <div style={S.chartContainer}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={priorityChartData}>
//                   <CartesianGrid stroke="#1e1e2e" />
//                   <XAxis dataKey="priority" />
//                   <YAxis />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Bar dataKey="count" fill="#68d391" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }