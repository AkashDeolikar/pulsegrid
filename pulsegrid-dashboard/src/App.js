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
  logoSub:  { fontSize:'8px', color:'#1e1e3a', letterSpacing:'0.12em', marginTop:'2px' },
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
    color:         '#2a2a4e',
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
    overflow:      'hidden',
    background:    '#08080f',
  },
};

// import { useState } from 'react';
// import Login               from './components/Login';
// import Register            from './components/Register';
// import Dashboard           from './components/Dashboard';
// import EventPublisher      from './components/EventPublisher';
// import EventHistory        from './components/EventHistory';
// import SubscriptionManager from './components/SubscriptionManager';
// import AnomalyCenter       from './components/AnomalyCenter';
// import QueueConsole        from './components/QueueConsole';
// import TopicExplorer       from './components/TopicExplorer';
// import UserSettings        from './components/UserSettings';
// import APIPlayground       from './components/APIPlayground';
// import { useAnomalySocket } from './hooks/useAnomalysocket';

// // ── Navigation definition ─────────────────────────────────────────
// const NAV = [
//   { id:'publisher',     label:'Events',         icon:'⚡', group:'main'    },
//   { id:'history',       label:'History',        icon:'📋', group:'main'    },
//   { id:'topics',        label:'Topics',         icon:'🗂',  group:'main'    },
//   { id:'subscriptions', label:'Subscriptions',  icon:'📌', group:'main'    },
//   { id:'anomalies',     label:'Anomalies',      icon:'🚨', group:'monitor' },
//   { id:'queues',        label:'Queues',         icon:'⚙️',  group:'monitor' },
//   { id:'dashboard',     label:'Analytics',      icon:'📊', group:'monitor' },
//   { id:'playground',    label:'API',            icon:'🧪', group:'dev'     },
//   { id:'settings',      label:'Settings',       icon:'⚙',  group:'dev'     },
// ];

// const NAV_GROUPS = [
//   { id:'main',    label:'Manage'  },
//   { id:'monitor', label:'Monitor' },
//   { id:'dev',     label:'Dev'     },
// ];

// // ── Method colors for badge ───────────────────────────────────────
// const WS_CONFIG = {
//   connected:    { color:'#22c55e', label:'● live'        },
//   connecting:   { color:'#f59e0b', label:'◌ connecting'  },
//   disconnected: { color:'#ef4444', label:'○ offline'     },
// };

// export default function App() {
//   const [token,    setToken]    = useState(() => localStorage.getItem('pg_token') || null);
//   const [page,     setPage]     = useState('publisher');
//   const [authMode, setAuthMode] = useState('login');

//   const { wsStatus, alerts } = useAnomalySocket(token);

//   const handleLogin = (t) => {
//     localStorage.setItem('pg_token', t);
//     setToken(t);
//     setPage('publisher');
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('pg_token');
//     setToken(null);
//     setPage('publisher');
//     setAuthMode('login');
//   };

//   // ── Unauthenticated ───────────────────────────────────────────
//   if (!token) {
//     return authMode === 'register'
//       ? <Register onRegister={handleLogin}  onSwitchToLogin={() => setAuthMode('login')} />
//       : <Login    onLogin={handleLogin}     onSwitchToRegister={() => setAuthMode('register')} />;
//   }

//   // ── Badges ───────────────────────────────────────────────────
//   const critCount = alerts.filter(a => a.severity === 'critical').length;
//   const wsConf    = WS_CONFIG[wsStatus] || WS_CONFIG.disconnected;

//   // ── App shell ─────────────────────────────────────────────────
//   return (
//     <div style={shell.root}>

//       {/* ── NAVBAR ── */}
//       <nav style={shell.nav}>

//         {/* Logo */}
//         <div style={shell.logo}>
//           <span style={shell.logoIcon}>⚡</span>
//           <div>
//             <div style={shell.logoName}>PulseGrid</div>
//             <div style={shell.logoSub}>event platform</div>
//           </div>
//         </div>

//         <div style={shell.navDivider} />

//         {/* Page groups */}
//         {NAV_GROUPS.map(group => (
//           <div key={group.id} style={shell.navGroup}>
//             <div style={shell.groupLabel}>{group.label}</div>
//             {NAV.filter(n => n.group === group.id).map(({ id, label, icon }) => {
//               const isActive  = page === id;
//               const hasBadge  = id === 'anomalies' && critCount > 0;
//               return (
//                 <button
//                   key={id}
//                   style={{ ...shell.navBtn, ...(isActive ? shell.navBtnActive : {}) }}
//                   onClick={() => setPage(id)}
//                   title={label}
//                 >
//                   <span style={shell.navIcon}>{icon}</span>
//                   <span style={shell.navLabel}>{label}</span>
//                   {hasBadge && <span style={shell.badge}>{critCount}</span>}
//                 </button>
//               );
//             })}
//           </div>
//         ))}

//         {/* Bottom: WS status + sign out */}
//         <div style={shell.navBottom}>
//           <div style={shell.wsBadge}>
//             <div style={{ ...shell.wsDot, background:wsConf.color, boxShadow:`0 0 6px ${wsConf.color}88` }} />
//             <span style={{ ...shell.wsLabel, color:wsConf.color }}>{wsConf.label}</span>
//           </div>
//           <button style={shell.signOut} onClick={handleLogout}>Sign out</button>
//         </div>
//       </nav>

//       {/* ── PAGE ── */}
//       <main style={shell.main}>
//         {page === 'publisher'     && <EventPublisher      token={token} />}
//         {page === 'history'       && <EventHistory         token={token} />}
//         {page === 'topics'        && <TopicExplorer        token={token} />}
//         {page === 'subscriptions' && <SubscriptionManager  token={token} />}
//         {page === 'anomalies'     && <AnomalyCenter        token={token} />}
//         {page === 'queues'        && <QueueConsole         token={token} />}
//         {page === 'dashboard'     && <Dashboard            token={token} onLogout={handleLogout} />}
//         {page === 'playground'    && <APIPlayground        token={token} />}
//         {page === 'settings'      && <UserSettings         token={token} />}
//       </main>
//     </div>
//   );
// }

// // ── Styles ────────────────────────────────────────────────────────
// const shell = {
//   root: {
//     display:        'flex',
//     height:         '100vh',
//     background:     '#08080f',
//     fontFamily:     '"JetBrains Mono","Fira Code",monospace',
//     overflow:       'hidden',
//   },
//   nav: {
//     width:          '176px',
//     background:     '#0a0a12',
//     borderRight:    '1px solid #12122a',
//     display:        'flex',
//     flexDirection:  'column',
//     padding:        '16px 10px',
//     flexShrink:     0,
//     overflow:       'hidden',
//   },
//   logo: {
//     display:        'flex',
//     alignItems:     'center',
//     gap:            '8px',
//     paddingLeft:    '6px',
//     marginBottom:   '4px',
//   },
//   logoIcon:  { fontSize:'16px' },
//   logoName:  { fontSize:'11px', fontWeight:'700', color:'#e8e6f0', letterSpacing:'0.04em', lineHeight:1 },
//   logoSub:   { fontSize:'8px', color:'#96969f', letterSpacing:'0.12em', marginTop:'2px' },
//   navDivider:{ height:'1px', background:'#1c1c4d', margin:'12px 0' },
//   navGroup:  { marginBottom:'16px' },
//   groupLabel:{ fontSize:'8px', color:'#616161', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:'4px', paddingLeft:'8px', fontWeight:'600' },
//   navBtn: {
//     display:        'flex',
//     alignItems:     'center',
//     gap:            '7px',
//     width:          '100%',
//     background:     'transparent',
//     border:         'none',
//     borderRadius:   '5px',
//     padding:        '7px 8px',
//     fontSize:       '10px',
//     fontWeight:     '500',
//     cursor:         'pointer',
//     color:          '#8a8a9a',
//     letterSpacing:  '0.04em',
//     fontFamily:     'inherit',
//     textAlign:      'left',
//     transition:     'all 0.12s',
//     position:       'relative',
//   },
//   navBtnActive: {
//     background:     '#10102a',
//     color:          '#8b9cf4',
//   },
//   navIcon:  { fontSize:'11px', lineHeight:1, flexShrink:0 },
//   navLabel: { flex:1, lineHeight:1 },
//   badge: {
//     background:     '#ef4444',
//     color:          '#fff',
//     fontSize:       '8px',
//     fontWeight:     '700',
//     padding:        '1px 5px',
//     borderRadius:   '8px',
//     lineHeight:     '13px',
//     minWidth:       '14px',
//     textAlign:      'center',
//   },
//   navBottom: {
//     marginTop:      'auto',
//     display:        'flex',
//     flexDirection:  'column',
//     gap:            '8px',
//     borderTop:      '1px solid #10102a',
//     paddingTop:     '12px',
//   },
//   wsBadge: {
//     display:        'flex',
//     alignItems:     'center',
//     gap:            '6px',
//     padding:        '5px 8px',
//     background:     '#0d0d1a',
//     border:         '1px solid #12122a',
//     borderRadius:   '5px',
//   },
//   wsDot:    { width:'6px', height:'6px', borderRadius:'50%', flexShrink:0 },
//   wsLabel:  { fontSize:'9px', fontWeight:'500', letterSpacing:'0.06em' },
//   signOut: {
//     background:     'transparent',
//     border:         '1px solid #12122a',
//     borderRadius:   '4px',
//     color:          '#2a2a4e',
//     fontSize:       '9px',
//     padding:        '5px 8px',
//     cursor:         'pointer',
//     letterSpacing:  '0.06em',
//     fontFamily:     'inherit',
//     width:          '100%',
//     transition:     'all 0.12s',
//   },
//   main: {
//     flex:           1,
//     overflow:       'hidden',
//     background:     '#08080f',
//   },
// };

// // import { useState } from 'react';

// // import Login from './components/Login';
// // import Register from './components/Register';
// // import Dashboard from './components/Dashboard';
// // import EventPublisher from './components/EventPublisher';
// // import EventHistory from './components/EventHistory';
// // import SubscriptionManager from './components/SubscriptionManager';
// // import AnomalyCenter from './components/AnomalyCenter';
// // import QueueConsole from './components/QueueConsole';

// // import { useAnomalySocket } from './hooks/useAnomalysocket';

// // const NAV = [
// //   { id: 'publisher', label: 'Events', icon: '⚡' },
// //   { id: 'history', label: 'History', icon: '📋' },
// //   { id: 'subscriptions', label: 'Subscriptions', icon: '📌' },
// //   { id: 'anomalies', label: 'Anomalies', icon: '🚨' },
// //   { id: 'queues', label: 'Queues', icon: '⚙️' },
// //   { id: 'dashboard', label: 'Analytics', icon: '📊' },
// // ];

// // export default function App() {
// //   const [token, setToken] = useState(() => {
// //     try {
// //       return localStorage.getItem('pg_token');
// //     } catch {
// //       return null;
// //     }
// //   });

// //   // ✅ IMPORTANT: default page = dashboard (so always visible)
// //   const [page, setPage] = useState('dashboard');
// //   const [authMode, setAuthMode] = useState('login');

// //   const { wsStatus, alerts = [] } = useAnomalySocket(token) || {};

// //   const handleLogin = (t) => {
// //     localStorage.setItem('pg_token', t);
// //     setToken(t);
// //     setPage('dashboard'); // ✅ go to dashboard after login
// //   };

// //   const handleLogout = () => {
// //     localStorage.removeItem('pg_token');
// //     setToken(null);
// //     setAuthMode('login');
// //   };

// //   // ── AUTH ──
// //   if (!token) {
// //     return authMode === 'register' ? (
// //       <Register
// //         onRegister={handleLogin}
// //         onSwitchToLogin={() => setAuthMode('login')}
// //       />
// //     ) : (
// //       <Login
// //         onLogin={handleLogin}
// //         onSwitchToRegister={() => setAuthMode('register')}
// //       />
// //     );
// //   }

// //   // ── WS STATUS ──
// //   const wsColor =
// //     {
// //       connected: '#22c55e',
// //       connecting: '#f59e0b',
// //       disconnected: '#ef4444',
// //     }[wsStatus] || '#ef4444';

// //   const wsLabel =
// //     {
// //       connected: '● live',
// //       connecting: '◌ connecting',
// //       disconnected: '○ offline',
// //     }[wsStatus] || '○ offline';

// //   const critCount = alerts.filter(
// //     (a) => a?.severity === 'critical'
// //   ).length;

// //   // ── PAGE RENDER (SAFE FALLBACK) ──
// //   const renderPage = () => {
// //     switch (page) {
// //       case 'publisher':
// //         return <EventPublisher token={token} />;
// //       case 'history':
// //         return <EventHistory token={token} />;
// //       case 'subscriptions':
// //         return <SubscriptionManager token={token} />;
// //       case 'anomalies':
// //         return <AnomalyCenter token={token} />;
// //       case 'queues':
// //         return <QueueConsole token={token} />;
// //       case 'dashboard':
// //       default:
// //         return <Dashboard token={token} onLogout={handleLogout} />;
// //     }
// //   };

// //   return (
// //     <div style={shell.root}>
// //       {/* NAVBAR */}
// //       <nav style={shell.nav}>
// //         <div style={shell.logo}>
// //           <span>⚡</span>
// //           <div>
// //             <div style={shell.logoName}>PulseGrid</div>
// //             <div style={shell.logoSub}>event platform</div>
// //           </div>
// //         </div>

// //         <div style={shell.navLinks}>
// //           {NAV.map(({ id, label, icon }) => {
// //             const isActive = page === id;
// //             const hasBadge = id === 'anomalies' && critCount > 0;

// //             return (
// //               <button
// //                 key={id}
// //                 onClick={() => setPage(id)}
// //                 style={{
// //                   ...shell.navBtn,
// //                   ...(isActive ? shell.navBtnActive : {}),
// //                 }}
// //               >
// //                 <span>{icon}</span>
// //                 <span>{label}</span>

// //                 {hasBadge && (
// //                   <span style={shell.badge}>{critCount}</span>
// //                 )}
// //               </button>
// //             );
// //           })}
// //         </div>

// //         <div style={shell.navRight}>
// //           <div style={shell.wsBadge}>
// //             <div
// //               style={{
// //                 ...shell.wsDot,
// //                 background: wsColor,
// //               }}
// //             />
// //             <span style={{ color: wsColor }}>{wsLabel}</span>
// //           </div>

// //           <button style={shell.signOut} onClick={handleLogout}>
// //             Sign out
// //           </button>
// //         </div>
// //       </nav>

// //       {/* PAGE */}
// //       <main style={shell.main}>{renderPage()}</main>
// //     </div>
// //   );
// // }

// // const shell = {
// //   root: {
// //     display: 'flex',
// //     flexDirection: 'column',
// //     height: '100vh',
// //     background: '#08080f',
// //     color: '#e2e8f0',
// //   },
// //   nav: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     padding: '0 20px',
// //     height: '50px',
// //     background: '#0a0a12',
// //   },
// //   logo: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     gap: '10px',
// //     marginRight: '20px',
// //   },
// //   logoName: { fontSize: '12px', fontWeight: 'bold' },
// //   logoSub: { fontSize: '8px', color: '#666' },

// //   navLinks: { display: 'flex', gap: '5px', flex: 1 },

// //   navBtn: {
// //     background: 'transparent',
// //     border: 'none',
// //     color: '#aaa',
// //     cursor: 'pointer',
// //     padding: '6px 10px',
// //   },

// //   navBtnActive: {
// //     color: '#8b9cf4',
// //     background: '#10102a',
// //   },

// //   badge: {
// //     background: 'red',
// //     color: '#fff',
// //     fontSize: '10px',
// //     padding: '2px 6px',
// //     borderRadius: '10px',
// //     marginLeft: '4px',
// //   },

// //   navRight: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     gap: '10px',
// //   },

// //   wsBadge: {
// //     display: 'flex',
// //     alignItems: 'center',
// //     gap: '5px',
// //   },

// //   wsDot: {
// //     width: '6px',
// //     height: '6px',
// //     borderRadius: '50%',
// //   },

// //   signOut: {
// //     background: 'transparent',
// //     border: '1px solid #333',
// //     color: '#aaa',
// //     cursor: 'pointer',
// //   },

// //   main: {
// //     flex: 1,
// //     overflow: 'auto',
// //   },
// // };

// // // import { useState } from 'react';
// // // import Login from './components/Login';
// // // import Register from './components/Register';
// // // import Dashboard from './components/Dashboard';
// // // import EventPublisher from './components/EventPublisher';
// // // import Navbar from './components/Navbar';
// // // import { useAnomalySocket } from './hooks/useAnomalysocket';

// // // export default function App() {
// // //   const [token,   setToken]   = useState(() => localStorage.getItem('pg_token') || null);
// // //   const [page,    setPage]    = useState('publisher'); // publisher | dashboard
// // //   const [authMode, setAuthMode] = useState('login');   // login | register

// // //   // Global WebSocket for anomaly status in navbar
// // //   const { wsStatus } = useAnomalySocket(token);

// // //   const handleLogin = (t) => {
// // //     localStorage.setItem('pg_token', t);
// // //     setToken(t);
// // //     setPage('publisher');
// // //   };

// // //   const handleLogout = () => {
// // //     localStorage.removeItem('pg_token');
// // //     setToken(null);
// // //     setPage('publisher');
// // //     setAuthMode('login');
// // //   };

// // //   // ── Not authenticated ──
// // //   if (!token) {
// // //     if (authMode === 'register') {
// // //       return (
// // //         <Register
// // //           onRegister={handleLogin}
// // //           onSwitchToLogin={() => setAuthMode('login')}
// // //         />
// // //       );
// // //     }
// // //     return (
// // //       <Login
// // //         onLogin={handleLogin}
// // //         onSwitchToRegister={() => setAuthMode('register')}
// // //       />
// // //     );
// // //   }

// // //   // ── Authenticated ──
// // //   return (
// // //     <div style={{ background: '#08080f', minHeight: '100vh' }}>
// // //       <Navbar
// // //         currentPage={page}
// // //         onNavigate={setPage}
// // //         onLogout={handleLogout}
// // //         wsStatus={wsStatus}
// // //       />
// // //       {page === 'publisher'
// // //         ? <EventPublisher token={token} />
// // //         : <Dashboard token={token} onLogout={handleLogout} />
// // //       }
// // //     </div>
// // //   );
// // // }