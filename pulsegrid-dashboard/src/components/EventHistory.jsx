import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const PRIORITIES = ['all', 'urgent', 'normal', 'low'];
const STATUSES   = ['all', 'delivered', 'queued', 'failed'];
const PAGE_SIZE  = 15;

const P_STYLE = {
  urgent: { bg:'#1a0808', border:'#2a1010', color:'#ef4444' },
  normal: { bg:'#08101a', border:'#10182a', color:'#63b3ed' },
  low:    { bg:'#081408', border:'#101e10', color:'#22c55e' },
};
const S_COLOR = {
  delivered: '#22c55e',
  queued:    '#f59e0b',
  failed:    '#ef4444',
};

export default function EventHistory({ token }) {
  const [events,   setEvents]   = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const [search,   setSearch]   = useState('');
  const [priority, setPriority] = useState('all');
  const [status,   setStatus]   = useState('all');
  const [debSearch, setDebSearch] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debSearch, priority, status]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        page, limit: PAGE_SIZE,
        ...(debSearch           && { topic:    debSearch }),
        ...(priority !== 'all'  && { priority: priority }),
        ...(status   !== 'all'  && { status:   status   }),
      });
      const res = await axios.get(`${config.API_BASE}/events?${p}`, { headers });
      setEvents(res.data.events || []);
      setTotal(res.data.total   || 0);
    } catch (err) {
      console.error('[EventHistory]', err);
    } finally {
      setLoading(false);
    }
  }, [page, debSearch, priority, status, token]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Build page numbers array
  const pageNums = () => {
    const start = Math.max(1, Math.min(totalPages - 4, page - 2));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  };

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.topBar}>
        <div>
          <div style={S.title}>Event History</div>
          <div style={S.sub}>{total.toLocaleString()} total events</div>
        </div>
        <button style={S.refreshBtn} onClick={fetchEvents}>↻ Refresh</button>
      </div>

      {/* Filters */}
      <div style={S.filters}>
        <input
          style={S.search}
          type="text"
          placeholder="Search by topic..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FilterGroup label="Priority" options={PRIORITIES} value={priority} onChange={setPriority} />
        <FilterGroup label="Status"   options={STATUSES}   value={status}   onChange={setStatus}   />
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Event ID','Topic','Priority','Status','Created','Delivered'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={S.centerCell}>
                <span style={S.loadText}>Loading...</span>
              </td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={6} style={S.centerCell}>
                <span style={S.emptyText}>No events found</span>
              </td></tr>
            ) : events.map(evt => {
              const ps = P_STYLE[evt.priority] || P_STYLE.normal;
              return (
                <tr
                  key={evt.id}
                  style={S.tr}
                  onClick={() => setSelected(evt)}
                  onMouseEnter={e => e.currentTarget.style.background = '#0d0d1a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={S.td}><span style={S.idCell}>{evt.id.slice(0,8)}...</span></td>
                  <td style={S.td}><span style={S.topicCell}>{evt.topic}</span></td>
                  <td style={S.td}>
                    <span style={{...S.badge, background:ps.bg, border:`1px solid ${ps.border}`, color:ps.color}}>
                      {evt.priority}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{...S.statusText, color: S_COLOR[evt.status] || '#a0a0c0'}}>
                      {evt.status}
                    </span>
                  </td>
                  <td style={S.td}><span style={S.timeCell}>{fmtTime(evt.created_at)}</span></td>
                  <td style={S.td}>
                    <span style={S.timeCell}>
                      {evt.delivered_at ? fmtTime(evt.delivered_at) : <span style={{color:'#2a2a4e'}}>—</span>}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={S.pagination}>
        <span style={S.pageInfo}>Page {page} of {totalPages} · {total} events</span>
        <div style={S.pageBtns}>
          <PBtn label="«" onClick={() => setPage(1)}              disabled={page===1} />
          <PBtn label="‹" onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} />
          {pageNums().map(n => (
            <PBtn key={n} label={n} onClick={() => setPage(n)} active={page===n} />
          ))}
          <PBtn label="›" onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} />
          <PBtn label="»" onClick={() => setPage(totalPages)}    disabled={page===totalPages} />
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <span style={S.modalTitle}>Event Detail</span>
              <button style={S.closeBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={S.modalBody}>
              {[
                ['ID',         selected.id,        true],
                ['Topic',      selected.topic,      true],
                ['Priority',   selected.priority,   false],
                ['Status',     selected.status,     false],
                ['Retry Count',selected.retry_count ?? 0, false],
                ['Created',    fmtFull(selected.created_at),  false],
                ['Delivered',  selected.delivered_at ? fmtFull(selected.delivered_at) : '—', false],
              ].map(([label, val, mono]) => (
                <div key={label} style={S.detailRow}>
                  <span style={S.detailLabel}>{label}</span>
                  <span style={{...S.detailVal, fontFamily: mono ? 'monospace' : 'inherit'}}>{String(val)}</span>
                </div>
              ))}
              <div style={S.payloadLabel}>Payload</div>
              <pre style={S.payloadPre}>{JSON.stringify(selected.payload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────
function FilterGroup({ label, options, value, onChange }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
      <span style={{fontSize:'9px',color:'#2a2a4e',letterSpacing:'0.1em',textTransform:'uppercase',marginRight:'4px'}}>{label}</span>
      {options.map(o => (
        <button
          key={o}
          style={{
            ...fS.chip,
            ...(value===o ? fS.chipActive : {})
          }}
          onClick={() => onChange(o)}
        >{o}</button>
      ))}
    </div>
  );
}
function PBtn({ label, onClick, disabled, active }) {
  return (
    <button
      style={{...pS.btn, ...(active?pS.btnActive:{}), opacity:disabled?0.3:1}}
      onClick={onClick}
      disabled={disabled}
    >{label}</button>
  );
}

// ── Helpers ─────────────────────────────────────────────────────
const fmtTime = d => new Date(d).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const fmtFull = d => new Date(d).toLocaleString();

// ── Styles ───────────────────────────────────────────────────────
const S = {
  page:       {display:'flex',flexDirection:'column',height:'calc(100vh - 56px)',background:'#08080f',fontFamily:'"JetBrains Mono","Fira Code",monospace',padding:'20px 24px',gap:'14px',overflow:'hidden'},
  topBar:     {display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexShrink:0},
  title:      {fontSize:'14px',fontWeight:'600',color:'#e8e6f0',letterSpacing:'0.04em'},
  sub:        {fontSize:'10px',color:'#3a3a5c',marginTop:'3px',letterSpacing:'0.06em'},
  refreshBtn: {background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'5px',color:'#3a3a5c',fontSize:'10px',padding:'6px 12px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.05em'},
  filters:    {display:'flex',alignItems:'center',gap:'14px',flexShrink:0,flexWrap:'wrap'},
  search:     {background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'5px',padding:'8px 12px',color:'#e8e6f0',fontSize:'11px',outline:'none',fontFamily:'inherit',width:'200px'},
  tableWrap:  {flex:1,overflowY:'auto',borderRadius:'8px',border:'1px solid #14142a'},
  table:      {width:'100%',borderCollapse:'collapse'},
  th:         {background:'#0d0d1a',padding:'10px 14px',textAlign:'left',fontSize:'9px',color:'#3a3a5c',letterSpacing:'0.1em',textTransform:'uppercase',borderBottom:'1px solid #14142a',position:'sticky',top:0,zIndex:1},
  tr:         {cursor:'pointer',transition:'background 0.1s',borderBottom:'1px solid #0e0e1e'},
  td:         {padding:'11px 14px',verticalAlign:'middle'},
  idCell:     {fontSize:'10px',color:'#3a3a5c',fontFamily:'monospace'},
  topicCell:  {fontSize:'11px',color:'#8b9cf4',fontWeight:'500',letterSpacing:'0.03em'},
  badge:      {fontSize:'9px',padding:'2px 8px',borderRadius:'4px',letterSpacing:'0.06em',fontWeight:'500'},
  statusText: {fontSize:'10px',letterSpacing:'0.05em'},
  timeCell:   {fontSize:'10px',color:'#3a3a5c'},
  centerCell: {padding:'40px',textAlign:'center'},
  loadText:   {color:'#3a3a5c',fontSize:'11px',letterSpacing:'0.05em'},
  emptyText:  {color:'#2a2a4e',fontSize:'11px',letterSpacing:'0.05em'},
  pagination: {display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,borderTop:'1px solid #0e0e1e',paddingTop:'12px'},
  pageInfo:   {fontSize:'10px',color:'#3a3a5c',letterSpacing:'0.05em'},
  pageBtns:   {display:'flex',gap:'4px'},
  overlay:    {position:'fixed',inset:0,background:'#00000088',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000},
  modal:      {background:'#0d0d1a',border:'1px solid #1a1a30',borderRadius:'10px',width:'520px',maxHeight:'80vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px #00000080'},
  modalHead:  {display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid #14142a'},
  modalTitle: {fontSize:'12px',fontWeight:'600',color:'#e8e6f0',letterSpacing:'0.05em'},
  closeBtn:   {background:'none',border:'none',color:'#3a3a5c',fontSize:'14px',cursor:'pointer',fontFamily:'inherit',padding:'0 4px'},
  modalBody:  {padding:'16px 20px',overflowY:'auto'},
  detailRow:  {display:'flex',gap:'16px',padding:'7px 0',borderBottom:'1px solid #0e0e1e',alignItems:'flex-start'},
  detailLabel:{fontSize:'10px',color:'#3a3a5c',textTransform:'uppercase',letterSpacing:'0.08em',minWidth:'90px',paddingTop:'1px'},
  detailVal:  {fontSize:'11px',color:'#a0a0c0',wordBreak:'break-all'},
  payloadLabel:{fontSize:'10px',color:'#3a3a5c',textTransform:'uppercase',letterSpacing:'0.1em',margin:'14px 0 6px'},
  payloadPre: {background:'#080810',border:'1px solid #14142a',borderRadius:'6px',padding:'12px',color:'#8b9cf4',fontSize:'11px',lineHeight:'1.6',overflowX:'auto',margin:0,fontFamily:'monospace'},
};
const fS = {
  chip:       {background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'4px',color:'#3a3a5c',fontSize:'10px',padding:'4px 10px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'0.04em',transition:'all 0.12s'},
  chipActive: {background:'#10102a',border:'1px solid #5b6cf4',color:'#8b9cf4'},
};
const pS = {
  btn:        {background:'#0d0d1a',border:'1px solid #14142a',borderRadius:'4px',color:'#3a3a5c',fontSize:'11px',padding:'5px 10px',cursor:'pointer',fontFamily:'inherit',transition:'all 0.12s',minWidth:'32px'},
  btnActive:  {background:'#10102a',border:'1px solid #5b6cf4',color:'#8b9cf4'},
};