import { useState } from 'react';
import axios from 'axios';
import config from '../config';

const ENDPOINTS = [
  {
    group: 'Auth',
    items: [
      {
        id:     'me',
        method: 'GET',
        path:   '/auth/me',
        label:  'Get current user',
        auth:   true,
        body:   null,
      },
    ],
  },
  {
    group: 'Events',
    items: [
      {
        id:     'publish',
        method: 'POST',
        path:   '/events/publish',
        label:  'Publish event',
        auth:   true,
        body:   JSON.stringify({ topic:'orders', payload:{ orderId:'ORD-001', amount:1500 }, priority:'auto' }, null, 2),
      },
      {
        id:     'list-events',
        method: 'GET',
        path:   '/events?limit=5',
        label:  'List events',
        auth:   true,
        body:   null,
      },
    ],
  },
  {
    group: 'Subscriptions',
    items: [
      {
        id:     'my-subs',
        method: 'GET',
        path:   '/subscriptions/my',
        label:  'My subscriptions',
        auth:   true,
        body:   null,
      },
      {
        id:     'subscribe',
        method: 'POST',
        path:   '/subscriptions/subscribe',
        label:  'Subscribe to topic',
        auth:   true,
        body:   JSON.stringify({ topic:'orders' }, null, 2),
      },
      {
        id:     'unsubscribe',
        method: 'DELETE',
        path:   '/subscriptions/unsubscribe',
        label:  'Unsubscribe from topic',
        auth:   true,
        body:   JSON.stringify({ topic:'orders' }, null, 2),
      },
    ],
  },
  {
    group: 'Analytics',
    items: [
      {
        id:     'overview',
        method: 'GET',
        path:   '/analytics/overview',
        label:  'System overview',
        auth:   true,
        body:   null,
      },
      {
        id:     'throughput',
        method: 'GET',
        path:   '/analytics/throughput?minutes=30',
        label:  'Throughput (30 min)',
        auth:   true,
        body:   null,
      },
      {
        id:     'latency',
        method: 'GET',
        path:   '/analytics/latency',
        label:  'Latency percentiles',
        auth:   true,
        body:   null,
      },
      {
        id:     'anomalies',
        method: 'GET',
        path:   '/analytics/anomalies',
        label:  'Recent anomalies',
        auth:   true,
        body:   null,
      },
      {
        id:     'topics',
        method: 'GET',
        path:   '/analytics/topics',
        label:  'Topic breakdown',
        auth:   true,
        body:   null,
      },
    ],
  },
];

const METHOD_COLOR = {
  GET:    { color:'#22c55e', bg:'#08140a', border:'#22c55e33' },
  POST:   { color:'#63b3ed', bg:'#08101a', border:'#63b3ed33' },
  DELETE: { color:'#ef4444', bg:'#1a0808', border:'#ef444433' },
  PATCH:  { color:'#f59e0b', bg:'#140e08', border:'#f59e0b33' },
};

export default function APIPlayground({ token }) {
  const [selected,    setSelected]    = useState(ENDPOINTS[1].items[0]); // default: publish
  const [body,        setBody]        = useState(ENDPOINTS[1].items[0].body || '');
  const [response,    setResponse]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [statusCode,  setStatusCode]  = useState(null);
  const [elapsed,     setElapsed]     = useState(null);
  const [copied,      setCopied]      = useState(false);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json',
  };

  const selectEndpoint = (ep) => {
    setSelected(ep);
    setBody(ep.body || '');
    setResponse(null);
    setStatusCode(null);
    setElapsed(null);
  };

  const run = async () => {
    setLoading(true);
    setResponse(null);
    const start = Date.now();
    try {
      let parsedBody = null;
      if (body.trim()) {
        try { parsedBody = JSON.parse(body); }
        catch { setResponse({ error: 'Invalid JSON body' }); setLoading(false); return; }
      }

      const url = `${config.API_BASE}${selected.path}`;
      let res;
      if (selected.method === 'GET')    res = await axios.get(url,                { headers });
      if (selected.method === 'POST')   res = await axios.post(url, parsedBody,   { headers });
      if (selected.method === 'DELETE') res = await axios.delete(url, { headers, data: parsedBody });
      if (selected.method === 'PATCH')  res = await axios.patch(url, parsedBody,  { headers });

      setStatusCode(res.status);
      setResponse(res.data);
    } catch (err) {
      setStatusCode(err.response?.status || 0);
      setResponse(err.response?.data || { error: err.message });
    } finally {
      setElapsed(Date.now() - start);
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const curlSnippet = () => {
    const bodyPart = body.trim() ? `\\\n  -d '${body.replace(/\s+/g,' ')}'` : '';
    return `curl -X ${selected.method} '${config.API_BASE}${selected.path}' \\\n  -H 'Authorization: Bearer <token>' \\\n  -H 'Content-Type: application/json'${bodyPart}`;
  };

  const mCol = METHOD_COLOR[selected.method] || METHOD_COLOR.GET;
  const statusOk = statusCode && statusCode < 400;

  return (
    <div style={S.page}>

      {/* ── SIDEBAR: Endpoint list ── */}
      <div style={S.sidebar}>
        <div style={S.sideTitle}>API Endpoints</div>
        {ENDPOINTS.map(group => (
          <div key={group.group} style={S.group}>
            <div style={S.groupLabel}>{group.group}</div>
            {group.items.map(ep => {
              const mc = METHOD_COLOR[ep.method] || METHOD_COLOR.GET;
              return (
                <button
                  key={ep.id}
                  style={{
                    ...S.epBtn,
                    ...(selected.id === ep.id ? S.epBtnActive : {}),
                  }}
                  onClick={() => selectEndpoint(ep)}
                >
                  <span style={{ ...S.methodTag, color:mc.color, background:mc.bg, border:`1px solid ${mc.border}` }}>
                    {ep.method}
                  </span>
                  <span style={S.epLabel}>{ep.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── MAIN: Request + Response ── */}
      <div style={S.main}>

        {/* Request bar */}
        <div style={S.requestBar}>
          <span style={{ ...S.bigMethod, color:mCol.color, background:mCol.bg, border:`1px solid ${mCol.border}` }}>
            {selected.method}
          </span>
          <span style={S.urlDisplay}>
            <span style={S.baseUrl}>{config.API_BASE}</span>
            <span style={S.pathPart}>{selected.path}</span>
          </span>
          <button
            style={{ ...S.runBtn, opacity: loading ? 0.6 : 1 }}
            onClick={run}
            disabled={loading}
          >
            {loading ? '⟳ Running...' : '▶ Run'}
          </button>
        </div>

        {/* Request + Response panels */}
        <div style={S.panels}>

          {/* Left: Request */}
          <div style={S.panel}>
            <div style={S.panelHead}>
              <span style={S.panelTitle}>Request</span>
            </div>

            {/* Headers preview */}
            <div style={S.headersSection}>
              <div style={S.subLabel}>Headers</div>
              <div style={S.headerRow}>
                <span style={S.headerKey}>Authorization</span>
                <span style={S.headerVal}>Bearer ···{token?.slice(-8) || ''}</span>
              </div>
              <div style={S.headerRow}>
                <span style={S.headerKey}>Content-Type</span>
                <span style={S.headerVal}>application/json</span>
              </div>
            </div>

            {/* Body editor */}
            {selected.body !== null ? (
              <div style={S.bodySection}>
                <div style={S.subLabel}>Body (JSON)</div>
                <textarea
                  style={S.bodyEditor}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  spellCheck={false}
                  rows={10}
                />
              </div>
            ) : (
              <div style={S.noBody}>No request body</div>
            )}

            {/* cURL */}
            <div style={S.curlSection}>
              <div style={S.subLabel}>cURL equivalent</div>
              <pre style={S.curlPre}>{curlSnippet()}</pre>
            </div>
          </div>

          {/* Right: Response */}
          <div style={S.panel}>
            <div style={S.panelHead}>
              <span style={S.panelTitle}>Response</span>
              {statusCode && (
                <div style={S.statusRow}>
                  <span style={{
                    ...S.statusBadge,
                    color:      statusOk ? '#22c55e' : '#ef4444',
                    background: statusOk ? '#08140a' : '#1a0808',
                    border:     `1px solid ${statusOk ? '#22c55e33' : '#ef444433'}`,
                  }}>
                    {statusCode}
                  </span>
                  <span style={S.elapsedBadge}>{elapsed}ms</span>
                </div>
              )}
              {response && (
                <button style={S.copyBtn} onClick={copyResponse}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>

            {!response && !loading && (
              <div style={S.emptyResponse}>
                <div style={S.emptyIcon}>▶</div>
                <div style={S.emptyTitle}>Run a request to see the response</div>
                <div style={S.emptySub}>Click the Run button above</div>
              </div>
            )}

            {loading && (
              <div style={S.emptyResponse}>
                <div style={{ ...S.emptyTitle, color:'#5b6cf4' }}>Sending request...</div>
              </div>
            )}

            {response && (
              <pre style={S.responsePre}>
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:         { display:'grid', gridTemplateColumns:'240px 1fr', gap:'1px', height:'calc(100vh - 52px)', background:'#14142a', fontFamily:'"JetBrains Mono","Fira Code",monospace', overflow:'hidden' },
  sidebar:      { background:'#08080f', padding:'16px 12px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'0' },
  sideTitle:    { fontSize:'10px', fontWeight:'600', color:'#2a2a4e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'12px', paddingLeft:'6px' },
  group:        { marginBottom:'16px' },
  groupLabel:   { fontSize:'9px', color:'#2a2a4e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'4px', paddingLeft:'6px' },
  epBtn:        { display:'flex', alignItems:'center', gap:'7px', width:'100%', background:'transparent', border:'none', borderRadius:'5px', padding:'7px 8px', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'background 0.12s' },
  epBtnActive:  { background:'#10102a' },
  methodTag:    { fontSize:'8px', fontWeight:'700', padding:'2px 5px', borderRadius:'3px', letterSpacing:'0.06em', flexShrink:0 },
  epLabel:      { fontSize:'10px', color:'#5a5a7a', letterSpacing:'0.03em', lineHeight:1.2 },
  main:         { background:'#08080f', display:'flex', flexDirection:'column', overflow:'hidden', padding:'16px' },
  requestBar:   { display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px', flexShrink:0 },
  bigMethod:    { fontSize:'11px', fontWeight:'700', padding:'6px 12px', borderRadius:'5px', letterSpacing:'0.08em', flexShrink:0 },
  urlDisplay:   { flex:1, background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'5px', padding:'8px 12px', fontSize:'11px' },
  baseUrl:      { color:'#3a3a5c' },
  pathPart:     { color:'#8b9cf4', fontWeight:'500' },
  runBtn:       { background:'#5b6cf4', border:'none', borderRadius:'6px', padding:'8px 20px', color:'#fff', fontSize:'11px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em', flexShrink:0, boxShadow:'0 4px 16px #5b6cf422', transition:'opacity 0.15s' },
  panels:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', flex:1, overflow:'hidden' },
  panel:        { background:'#0a0a12', border:'1px solid #14142a', borderRadius:'8px', display:'flex', flexDirection:'column', overflow:'hidden' },
  panelHead:    { display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderBottom:'1px solid #0e0e1e', flexShrink:0 },
  panelTitle:   { fontSize:'10px', fontWeight:'600', color:'#3a3a5c', textTransform:'uppercase', letterSpacing:'0.1em', flex:1 },
  statusRow:    { display:'flex', gap:'6px', alignItems:'center' },
  statusBadge:  { fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'4px', letterSpacing:'0.05em' },
  elapsedBadge: { fontSize:'9px', color:'#3a3a5c', letterSpacing:'0.05em' },
  copyBtn:      { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'4px', color:'#3a3a5c', fontSize:'9px', padding:'3px 8px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.05em' },
  headersSection:{ padding:'10px 14px', borderBottom:'1px solid #0e0e1e', flexShrink:0 },
  subLabel:     { fontSize:'9px', color:'#2a2a4e', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' },
  headerRow:    { display:'flex', gap:'8px', padding:'3px 0', fontSize:'10px' },
  headerKey:    { color:'#5b6cf4', minWidth:'120px', letterSpacing:'0.03em' },
  headerVal:    { color:'#5a5a7a', letterSpacing:'0.03em' },
  bodySection:  { padding:'10px 14px', borderBottom:'1px solid #0e0e1e', flex:1, display:'flex', flexDirection:'column' },
  bodyEditor:   { flex:1, background:'#080810', border:'1px solid #14142a', borderRadius:'5px', padding:'10px 12px', color:'#8b9cf4', fontSize:'11px', fontFamily:'monospace', outline:'none', resize:'none', lineHeight:'1.6' },
  noBody:       { padding:'20px 14px', fontSize:'10px', color:'#2a2a4e', letterSpacing:'0.05em' },
  curlSection:  { padding:'10px 14px', flexShrink:0 },
  curlPre:      { background:'#080810', border:'1px solid #14142a', borderRadius:'5px', padding:'8px 10px', color:'#5a5a7a', fontSize:'9px', lineHeight:'1.6', overflow:'auto', margin:0, fontFamily:'monospace', maxHeight:'80px' },
  emptyResponse:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'6px' },
  emptyIcon:    { fontSize:'24px', color:'#1e1e3a', marginBottom:'4px' },
  emptyTitle:   { fontSize:'11px', color:'#3a3a5c', letterSpacing:'0.05em' },
  emptySub:     { fontSize:'10px', color:'#2a2a4e', letterSpacing:'0.04em' },
  responsePre:  { flex:1, padding:'12px 14px', color:'#a0c0a0', fontSize:'11px', lineHeight:'1.7', overflow:'auto', margin:0, fontFamily:'monospace', background:'transparent' },
};