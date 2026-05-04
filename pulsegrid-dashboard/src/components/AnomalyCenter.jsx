import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const SEVERITIES = ['all', 'critical', 'warning', 'normal', 'info'];
// const SEVERITIES = ['all', ...new Set(anomalies.map(a => a.severity))];

export default function AnomalyCenter({ token }) {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('all');
  const [acked, setAcked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('pg_acked') || '[]')); }
    catch { return new Set(); }
  });
  const [showAcked, setShowAcked] = useState(false);
  const [selected, setSelected] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${config.API_BASE}/analytics/anomalies?limit=100`, { headers });
      setAnomalies(res.data.anomalies || []);
    } catch (err) {
      console.error('[AnomalyCenter]', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAnomalies(); }, [fetchAnomalies]);

  // Persist acked to localStorage
  const acknowledge = (id) => {
    setAcked(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('pg_acked', JSON.stringify([...next]));
      return next;
    });
  };

  const unacknowledge = (id) => {
    setAcked(prev => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem('pg_acked', JSON.stringify([...next]));
      return next;
    });
  };

  // Export as CSV
  const exportCSV = () => {
    const rows = [
      ['ID', 'Topic', 'Z-Score', 'Current', 'Mean', 'Severity', 'Detected At'],
      ...anomalies.map(a => [
        a.id, a.topic, a.zScore, a.current, a.mean, a.severity,
        new Date(a.detectedAt).toISOString()
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = 'pulsegrid-anomalies.csv';
    el.click(); URL.revokeObjectURL(url);
  };

  // Filtered list
  const filtered = anomalies.filter(a => {
    if (!showAcked && acked.has(a.id)) return false;
    if (severity !== 'all' && a.severity !== severity) return false;
    return true;
  });

  const critCount = anomalies.filter(a => a.severity === 'critical' && !acked.has(a.id)).length;
  const warnCount = anomalies.filter(a => a.severity === 'warning' && !acked.has(a.id)).length;

  const SEVER_STYLE = {
    critical: { bg: '#1a0808', border: '#2a1010', color: '#ef4444', glow: '#ef444444' },
    warning: { bg: '#140e08', border: '#261a10', color: '#f59e0b', glow: '#f59e0b44' },
    info: { bg: '#08141a', border: '#102026', color: '#3b82f6', glow: '#3b82f644' },
    normal: { bg: '#081a10', border: '#10261a', color: '#22c55e', glow: '#22c55e44' },
  };
  //   const SEVER_STYLE = {
  //   critical: { bg:'#1a0808', border:'#2a1010', color:'#ef4444', glow:'#ef444444' },
  //   warning:  { bg:'#140e08', border:'#261a10', color:'#f59e0b', glow:'#f59e0b44' },
  //   info:     { bg:'#08141a', border:'#102026', color:'#3b82f6', glow:'#3b82f644' },
  //   normal:   { bg:'#081a10', border:'#10261a', color:'#22c55e', glow:'#22c55e44' },
  // };

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.topBar}>
        <div>
          <div style={S.title}>Anomaly Alert Center</div>
          <div style={S.sub}>{anomalies.length} total · {critCount} critical · {warnCount} warning</div>
        </div>
        <div style={S.topActions}>
          <button style={S.exportBtn} onClick={exportCSV} disabled={!anomalies.length}>
            ↓ Export CSV
          </button>
          <button style={S.refreshBtn} onClick={fetchAnomalies}>↻ Refresh</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={S.summaryRow}>
        {[
          { label: 'Total Anomalies', val: anomalies.length, color: '#8b9cf4' },
          { label: 'Critical', val: anomalies.filter(a => a.severity === 'critical').length, color: '#ef4444' },
          { label: 'Warning', val: anomalies.filter(a => a.severity === 'warning').length, color: '#f59e0b' },
          { label: 'Acknowledged', val: acked.size, color: '#22c55e' },
          { label: 'Active (unacked)', val: anomalies.filter(a => !acked.has(a.id)).length, color: '#8b9cf4' },
        ].map(({ label, val, color }) => (
          <div key={label} style={S.summaryCard}>
            <div style={{ ...S.summaryVal, color }}>{val}</div>
            <div style={S.summaryLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={S.filterBar}>
        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Severity</span>
          {SEVERITIES.map(sv => (
            <button
              key={sv}
              style={{ ...S.chip, ...(severity === sv ? S.chipActive : {}) }}
              onClick={() => setSeverity(sv)}
            >{sv}</button>
          ))}
        </div>
        <label style={S.ackedToggle}>
          <input
            type="checkbox"
            checked={showAcked}
            onChange={e => setShowAcked(e.target.checked)}
            style={{ accentColor: '#5b6cf4' }}
          />
          <span style={S.ackedLabel}>Show acknowledged</span>
        </label>
      </div>

      {/* Timeline */}
      <div style={S.timeline}>
        {loading ? (
          <div style={S.centerMsg}>Loading anomalies...</div>
        ) : filtered.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>🛡️</div>
            <div style={S.emptyTitle}>
              {anomalies.length === 0 ? 'No anomalies detected' : 'All anomalies acknowledged'}
            </div>
            <div style={S.emptySub}>
              {anomalies.length === 0
                ? 'System is running normally. Anomalies will appear here when detected.'
                : 'Toggle "Show acknowledged" to view history'
              }
            </div>
          </div>
        ) : (
          filtered.map((anomaly) => {
            const ss = SEVER_STYLE[anomaly.severity] || SEVER_STYLE.warning;
            const isAcked = acked.has(anomaly.id);
            return (
              <div
                key={anomaly.id}
                style={{
                  ...S.timelineItem,
                  borderColor: isAcked ? '#14142a' : ss.border,
                  opacity: isAcked ? 0.5 : 1,
                }}
                onClick={() => setSelected(anomaly)}
              >
                {/* Left: severity icon */}
                <div style={{ ...S.severityDot, background: ss.bg, border: `1px solid ${ss.border}`, boxShadow: isAcked ? 'none' : `0 0 8px ${ss.glow}` }}>
                  <span style={{ color: ss.color, fontSize: '12px' }}>
                    {anomaly.severity === 'critical' ? '🔴' : '🟡'}
                  </span>
                </div>

                {/* Content */}
                <div style={S.itemContent}>
                  <div style={S.itemTop}>
                    <span style={{ ...S.itemSeverity, color: ss.color }}>{anomaly.severity?.toUpperCase()}</span>
                    <span style={S.itemTopic}>{anomaly.topic}</span>
                    <span style={S.itemTime}>{new Date(anomaly.detectedAt).toLocaleString()}</span>
                  </div>
                  <div style={S.itemStats}>
                    <Stat label="Z-Score" val={anomaly.zScore} highlight={anomaly.zScore >= 3} />
                    <Stat label="Current" val={`${anomaly.current}/min`} />
                    <Stat label="Mean" val={`${anomaly.mean}/min`} />
                    <Stat label="Std Dev" val={anomaly.stddev} />
                  </div>
                  {isAcked && <div style={S.ackedBadge}>✓ acknowledged</div>}
                </div>

                {/* Actions */}
                <div style={S.itemActions} onClick={e => e.stopPropagation()}>
                  {isAcked ? (
                    <button style={S.unackBtn} onClick={() => unacknowledge(anomaly.id)}>
                      Unmark
                    </button>
                  ) : (
                    <button style={S.ackBtn} onClick={() => acknowledge(anomaly.id)}>
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <span style={S.modalTitle}>Anomaly Detail</span>
              <button style={S.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              {[
                ['ID', selected.id],
                ['Topic', selected.topic],
                ['Severity', selected.severity?.toUpperCase()],
                ['Z-Score', selected.zScore],
                ['Current', `${selected.current} events/min`],
                ['Mean', `${selected.mean} events/min`],
                ['Std Dev', selected.stddev],
                ['Detected', new Date(selected.detectedAt).toLocaleString()],
              ].map(([label, val]) => (
                <div key={label} style={S.detailRow}>
                  <span style={S.detailLabel}>{label}</span>
                  <span style={S.detailVal}>{val}</span>
                </div>
              ))}
              <div style={S.explainer}>
                <div style={S.explainerTitle}>What this means</div>
                <div style={S.explainerText}>
                  The Z-score of <strong style={{ color: '#e8e6f0' }}>{selected.zScore}</strong> means the traffic
                  on <strong style={{ color: '#8b9cf4' }}>{selected.topic}</strong> was{' '}
                  <strong style={{ color: '#e8e6f0' }}>{selected.zScore}× standard deviations</strong> above
                  the 30-minute mean of {selected.mean} events/min.
                  {selected.severity === 'critical'
                    ? ' At Z≥3.0 there is a <0.3% chance this is normal variation.'
                    : ' At Z≥2.0 there is a <2.3% chance this is normal variation.'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, val, highlight }) {
  return (
    <div style={statS.wrap}>
      <span style={statS.label}>{label}</span>
      <span style={{ ...statS.val, color: highlight ? '#ef4444' : '#a0a0c0' }}>{val}</span>
    </div>
  );
}

const statS = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '2px' },
  label: { fontSize: '9px', color: '#2a2a4e', textTransform: 'uppercase', letterSpacing: '0.08em' },
  val: { fontSize: '12px', fontWeight: '600' },
};

const S = {
  page: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#08080f', fontFamily: '"JetBrains Mono","Fira Code",monospace', padding: '20px 24px', gap: '14px', overflow: 'hidden' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 },
  title: { fontSize: '14px', fontWeight: '600', color: '#e8e6f0', letterSpacing: '0.04em' },
  sub: { fontSize: '10px', color: '#3a3a5c', marginTop: '3px', letterSpacing: '0.06em' },
  topActions: { display: 'flex', gap: '8px' },
  exportBtn: { background: '#0d0d1a', border: '1px solid #14142a', borderRadius: '5px', color: '#3a3a5c', fontSize: '10px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em' },
  refreshBtn: { background: '#0d0d1a', border: '1px solid #14142a', borderRadius: '5px', color: '#3a3a5c', fontSize: '10px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em' },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', flexShrink: 0 },
  summaryCard: { background: '#0d0d1a', border: '1px solid #14142a', borderRadius: '7px', padding: '12px 14px' },
  summaryVal: { fontSize: '22px', fontWeight: '700', lineHeight: 1, marginBottom: '4px' },
  summaryLabel: { fontSize: '9px', color: '#3a3a5c', textTransform: 'uppercase', letterSpacing: '0.08em' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '4px' },
  filterLabel: { fontSize: '9px', color: '#2a2a4e', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '4px' },
  chip: { background: '#0d0d1a', border: '1px solid #14142a', borderRadius: '4px', color: '#3a3a5c', fontSize: '10px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em', transition: 'all 0.12s' },
  chipActive: { background: '#10102a', border: '1px solid #5b6cf4', color: '#8b9cf4' },
  ackedToggle: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' },
  ackedLabel: { fontSize: '10px', color: '#3a3a5c', letterSpacing: '0.05em' },
  timeline: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  timelineItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#0d0d1a', border: '1px solid', borderRadius: '8px', padding: '14px 16px', cursor: 'pointer', transition: 'opacity 0.2s' },
  severityDot: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemContent: { flex: 1, minWidth: 0 },
  itemTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  itemSeverity: { fontSize: '9px', fontWeight: '700', letterSpacing: '0.1em' },
  itemTopic: { fontSize: '12px', color: '#8b9cf4', fontWeight: '600', flex: 1, letterSpacing: '0.03em' },
  itemTime: { fontSize: '9px', color: '#2a2a4e', letterSpacing: '0.04em' },
  itemStats: { display: 'flex', gap: '20px' },
  ackedBadge: { marginTop: '8px', fontSize: '9px', color: '#22c55e', letterSpacing: '0.06em' },
  itemActions: { flexShrink: 0 },
  ackBtn: { background: '#0e1a0e', border: '1px solid #22c55e33', borderRadius: '5px', color: '#22c55e', fontSize: '10px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' },
  unackBtn: { background: '#0d0d1a', border: '1px solid #14142a', borderRadius: '5px', color: '#3a3a5c', fontSize: '10px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' },
  centerMsg: { color: '#3a3a5c', fontSize: '11px', letterSpacing: '0.05em', padding: '20px 0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '8px' },
  emptyIcon: { fontSize: '36px', opacity: 0.5 },
  emptyTitle: { fontSize: '12px', color: '#3a3a5c', letterSpacing: '0.05em', fontWeight: '600' },
  emptySub: { fontSize: '10px', color: '#2a2a4e', letterSpacing: '0.04em', textAlign: 'center', maxWidth: '280px' },
  overlay: { position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#0d0d1a', border: '1px solid #1a1a30', borderRadius: '10px', width: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px #00000080' },
  modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #14142a' },
  modalTitle: { fontSize: '12px', fontWeight: '600', color: '#e8e6f0', letterSpacing: '0.05em' },
  closeBtn: { background: 'none', border: 'none', color: '#3a3a5c', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', padding: '0 4px' },
  modalBody: { padding: '16px 20px', overflowY: 'auto' },
  detailRow: { display: 'flex', gap: '16px', padding: '7px 0', borderBottom: '1px solid #0e0e1e', alignItems: 'flex-start' },
  detailLabel: { fontSize: '10px', color: '#3a3a5c', textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '80px', paddingTop: '1px' },
  detailVal: { fontSize: '11px', color: '#a0a0c0' },
  explainer: { marginTop: '16px', background: '#080810', border: '1px solid #14142a', borderRadius: '6px', padding: '12px 14px' },
  explainerTitle: { fontSize: '10px', color: '#3a3a5c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' },
  explainerText: { fontSize: '11px', color: '#4a4a6a', lineHeight: '1.7', letterSpacing: '0.02em' },
};