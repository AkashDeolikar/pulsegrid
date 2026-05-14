import { useState } from 'react';
import Login               from './components/Login';
import Register            from './components/Register';
import Dashboard           from './components/Dashboard';
import EventPublisher      from './components/EventPublisher';
import EventHistory        from './components/EventHistory';
import SubscriptionManager from './components/SubscriptionManager';
import AnomalyCenter       from './components/AnomalyCenter';
import QueueConsole        from './components/QueueConsole';
import TopicExplorer       from './components/TopicExplorer';
import UserSettings        from './components/UserSettings';
import APIPlayground       from './components/APIPlayground';
import ErrorBoundary       from './components/ErrorBoundary';
import PulseGridTrailer from './components/Intro';
import { ToastProvider }   from './hooks/useToast';
import { useAnomalySocket } from './hooks/useAnomalysocket';

// ── Navigation ────────────────────────────────────────────────────
const NAV = [
  { id:'publisher',     label:'Events',        icon:'⚡', group:'main'    },
  { id:'history',       label:'History',       icon:'📋', group:'main'    },
  { id:'topics',        label:'Topics',        icon:'🗂',  group:'main'    },
  { id:'subscriptions', label:'Subscriptions', icon:'📌', group:'main'    },
  { id:'anomalies',     label:'Anomalies',     icon:'🚨', group:'monitor' },
  { id:'queues',        label:'Queues',        icon:'⚙️',  group:'monitor' },
  { id:'dashboard',     label:'Analytics',     icon:'📊', group:'monitor' },
  { id:'playground',    label:'API',           icon:'🧪', group:'dev'     },
  { id:'settings',      label:'Settings',      icon:'⚙',  group:'dev'     },
  { id:'Intro', label:'Intro', icon:'⚡', group:'dev' }
];

const GROUPS = [
  { id:'main',    label:'Manage'  },
  { id:'monitor', label:'Monitor' },
  { id:'dev',     label:'Dev'     },
];

const WS_CONFIG = {
  connected:    { color:'#22c55e', label:'● live'       },
  connecting:   { color:'#f59e0b', label:'◌ connecting' },
  disconnected: { color:'#ef4444', label:'○ offline'    },
};

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}

// ── Shell (needs ToastProvider above) ────────────────────────────
function AppShell() {
  const [token,    setToken]    = useState(() => localStorage.getItem('pg_token') || null);
  const [page,     setPage]     = useState('publisher');
  const [authMode, setAuthMode] = useState('login');

  const { wsStatus, alerts } = useAnomalySocket(token);

  const handleLogin = (t) => {
    localStorage.setItem('pg_token', t);
    setToken(t);
    setPage('publisher');
  };

  const handleLogout = () => {
    localStorage.removeItem('pg_token');
    setToken(null);
    setPage('publisher');
    setAuthMode('login');
  };

  // ── Unauthenticated ─────────────────────────────────────────
  if (!token) {
    return (
      <ErrorBoundary label="Auth page">
        {authMode === 'register'
          ? <Register onRegister={handleLogin}  onSwitchToLogin={() => setAuthMode('login')} />
          : <Login    onLogin={handleLogin}     onSwitchToRegister={() => setAuthMode('register')} />
        }
      </ErrorBoundary>
    );
  }

  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const wsConf    = WS_CONFIG[wsStatus] || WS_CONFIG.disconnected;

  // ── Authenticated app ────────────────────────────────────────
  return (
    <div style={shell.root}>

      {/* ── SIDEBAR NAV ── */}
      <nav style={shell.nav} role="navigation" aria-label="Main navigation">

        {/* Logo */}
        <div style={shell.logo}>
          <span style={shell.logoIcon}>⚡</span>
          <div>
            <div style={shell.logoName}>PulseGrid</div>
            <div style={shell.logoSub}>event platform</div>
          </div>
        </div>

        <div style={shell.divider} />

        {/* Groups */}
        {GROUPS.map(group => (
          <div key={group.id} style={shell.group}>
            <div style={shell.groupLabel}>{group.label}</div>
            {NAV.filter(n => n.group === group.id).map(({ id, label, icon }) => {
              const isActive = page === id;
              const badge    = id === 'anomalies' && critCount > 0;
              return (
                <button
                  key={id}
                  style={{ ...shell.navBtn, ...(isActive ? shell.navBtnActive : {}) }}
                  onClick={() => setPage(id)}
                  title={label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span style={shell.navIcon} aria-hidden="true">{icon}</span>
                  <span style={shell.navLabel}>{label}</span>
                  {badge && (
                    <span style={shell.badge} aria-label={`${critCount} critical alerts`}>
                      {critCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom: status + sign out */}
        <div style={shell.bottom}>
          <div style={shell.wsBadge} title={`WebSocket: ${wsStatus}`}>
            <div style={{ ...shell.wsDot, background:wsConf.color, boxShadow:`0 0 5px ${wsConf.color}88` }} />
            <span style={{ ...shell.wsLabel, color:wsConf.color }}>{wsConf.label}</span>
          </div>
          <button style={shell.signOut} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <main style={shell.main} role="main">
        <ErrorBoundary label={NAV.find(n => n.id === page)?.label || 'This page'}>
          {page === 'publisher'     && <EventPublisher      token={token} />}
          {page === 'history'       && <EventHistory         token={token} />}
          {page === 'topics'        && <TopicExplorer        token={token} />}
          {page === 'subscriptions' && <SubscriptionManager  token={token} />}
          {page === 'anomalies'     && <AnomalyCenter        token={token} />}
          {page === 'queues'        && <QueueConsole         token={token} />}
          {page === 'dashboard'     && <Dashboard            token={token} onLogout={handleLogout} />}
          {page === 'playground'    && <APIPlayground        token={token} />}
          {page === 'settings'      && <UserSettings         token={token} />}
        
          {page === 'Intro'         && <PulseGridTrailer />}
        </ErrorBoundary>
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const shell = {
  root: {
    display:       'flex',
    height:        '100vh',
    background:    '#08080f',
    fontFamily:    '"JetBrains Mono","Fira Code",monospace',
    overflow:      'hidden',
  },
  nav: {
    width:         '172px',
    background:    '#0a0a12',
    borderRight:   '1px solid #12122a',
    display:       'flex',
    flexDirection: 'column',
    padding:       '14px 10px',
    flexShrink:    0,
    overflow:      'hidden',
  },
  logo: {
    display:       'flex',
    alignItems:    'center',
    gap:           '8px',
    paddingLeft:   '6px',
    marginBottom:  '4px',
  },
  logoIcon: { fontSize:'16px' },
  logoName: { fontSize:'11px', fontWeight:'700', color:'#e8e6f0', letterSpacing:'0.04em', lineHeight:1 },
  logoSub:  { fontSize:'8px', color:'#d4d4dc', letterSpacing:'0.12em', marginTop:'2px' },
  divider:  { height:'1px', background:'#10102a', margin:'10px 0' },
  group:    { marginBottom:'14px' },
  groupLabel: {
    fontSize:    '8px', color:'#1a1a3e', textTransform:'uppercase',
    letterSpacing:'0.14em', marginBottom:'3px', paddingLeft:'8px', fontWeight:'600',
  },
  navBtn: {
    display:       'flex',
    alignItems:    'center',
    gap:           '7px',
    width:         '100%',
    background:    'transparent',
    border:        'none',
    borderRadius:  '5px',
    padding:       '7px 8px',
    fontSize:      '10px',
    fontWeight:    '500',
    cursor:        'pointer',
    color:         '#3a3a5c',
    letterSpacing: '0.04em',
    fontFamily:    'inherit',
    textAlign:     'left',
    transition:    'all 0.12s',
    position:      'relative',
  },
  navBtnActive: { background:'#10102a', color:'#8b9cf4' },
  navIcon:  { fontSize:'11px', lineHeight:1, flexShrink:0 },
  navLabel: { flex:1, lineHeight:1 },
  badge: {
    background:    '#ef4444', color:'#fff',
    fontSize:      '8px', fontWeight:'700',
    padding:       '1px 5px', borderRadius:'8px',
    lineHeight:    '13px', minWidth:'14px', textAlign:'center',
  },
  bottom: {
    marginTop:     'auto',
    display:       'flex',
    flexDirection: 'column',
    gap:           '6px',
    borderTop:     '1px solid #10102a',
    paddingTop:    '10px',
  },
  wsBadge: {
    display:       'flex',
    alignItems:    'center',
    gap:           '6px',
    padding:       '5px 8px',
    background:    '#0d0d1a',
    border:        '1px solid #12122a',
    borderRadius:  '5px',
  },
  wsDot:    { width:'5px', height:'5px', borderRadius:'50%', flexShrink:0 },
  wsLabel:  { fontSize:'9px', fontWeight:'500', letterSpacing:'0.06em' },
  signOut: {
    background:    'transparent',
    border:        '1px solid #12122a',
    borderRadius:  '4px',
    color:         '#cb4723',
    fontSize:      '9px',
    padding:       '5px 8px',
    cursor:        'pointer',
    letterSpacing: '0.06em',
    fontFamily:    'inherit',
    width:         '100%',
    transition:    'all 0.12s',
  },
  main: {
    flex:          1,
    minHeight:     0,
    overflowY:     'auto',
    background:    '#08080f',
  },
};
