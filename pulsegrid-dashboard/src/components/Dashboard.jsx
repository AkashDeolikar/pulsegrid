import { useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAnomalySocket } from '../hooks/useAnomalysocket';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const S = {
  page: { minHeight:'100vh', background:'#0a0a0f', color:'#e2e8f0', fontFamily:'monospace', padding:'24px' },
  header: { display:'flex', justifyContent:'space-between', marginBottom:24 },
  title: { fontSize:20, fontWeight:700 },
  meta: { fontSize:11, color:'#4a5568' },
  grid4: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 },
  card: { background:'#13131a', border:'1px solid #1e1e2e', borderRadius:10, padding:'16px' },
  cardTitle: { fontSize:11, color:'#4a5568', marginBottom:10 },
  bigNum: { fontSize:28, fontWeight:700 },
};

const StatCard = ({ label, value }) => (
  <div style={S.card}>
    <div style={S.cardTitle}>{label}</div>
    <div style={S.bigNum}>{value ?? '—'}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#111', padding:8, borderRadius:6 }}>
      <div>{label}</div>
      <div>{payload[0].value} events</div>
    </div>
  );
};

export default function Dashboard({ token, onLogout }) {
  const { data, loading, error, lastUpdated } = useAnalytics(token);
  const { alerts, wsStatus } = useAnomalySocket(token);

  // 🔥 UNIVERSAL THROUGHPUT FIX
  const throughputData = useMemo(() => {
    const raw = data?.throughput;

    if (!raw) return [];

    let arr = [];

    if (Array.isArray(raw)) arr = raw;
    else if (Array.isArray(raw.throughput)) arr = raw.throughput;
    else if (Array.isArray(raw.data)) arr = raw.data;

    return arr.map(d => ({
      time:
        d.time ||
        (d.timestamp
          ? new Date(d.timestamp).toLocaleTimeString()
          : ''),
      value:
        typeof d.value === 'number'
          ? d.value
          : typeof d.count === 'number'
          ? d.count
          : 0,
    }));
  }, [data]);

  if (loading) return <div style={S.page}>Loading...</div>;
  if (error) return <div style={S.page}>Error: {error}</div>;

  const overview = data?.overview || {};
  const latency = data?.latency || {};
  const topicsData = data?.topics?.topics || [];
  const priorityData = overview?.priority || [];

  return (
    <div style={S.page}>

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <div style={S.title}>⚡ PulseGrid</div>
          <div style={S.meta}>
            {wsStatus === 'connected' ? '● live' : '○ reconnecting'}
          </div>
        </div>

        <div>
          <div style={S.meta}>
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </div>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </div>

      {/* STATS */}
      <div style={S.grid4}>
        <StatCard label="Total Events" value={overview?.events?.total} />
        <StatCard label="Processed" value={overview?.events?.processed} />
        <StatCard label="Failed" value={overview?.events?.failed} />
        <StatCard label="Active Topics" value={topicsData.length} />
      </div>

      {/* THROUGHPUT */}
      <div style={S.card}>
        <div style={S.cardTitle}>Throughput</div>

        {throughputData.length === 0 ? (
          <div>No throughput data</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={throughputData}>
              <CartesianGrid stroke="#1e1e2e" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#63b3ed"
                fill="#63b3ed33"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* LATENCY + PRIORITY */}
      <div style={S.grid2}>

        <div style={S.card}>
          <div style={S.cardTitle}>Latency</div>
          <div>P50: {latency?.p50 ?? 0} ms</div>
          <div>P95: {latency?.p95 ?? 0} ms</div>
          <div>P99: {latency?.p99 ?? 0} ms</div>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Priority</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData}>
              <CartesianGrid stroke="#1e1e2e" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#68d391" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TOPICS + ALERTS */}
      <div style={S.grid2}>

        <div style={S.card}>
          <div style={S.cardTitle}>Top Topics</div>
          {topicsData.length === 0 ? (
            <div>No data</div>
          ) : (
            topicsData.slice(0,5).map((t, i) => (
              <div key={i}>
                {t.topic} — {t.count}
              </div>
            ))
          )}
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Live Alerts ({alerts.length})</div>
          {alerts.length === 0 ? (
            <div>No anomalies</div>
          ) : (
            alerts.map((a, i) => (
              <div key={i}>
                <strong>{a.topic}</strong> — Z={a.zScore}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}