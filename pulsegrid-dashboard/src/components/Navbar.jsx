import { useState } from 'react';

const NAV_PAGES = [
  { id: 'publisher', label: 'Events',    icon: '⚡' },
  { id: 'dashboard', label: 'Analytics', icon: '📊' },
];

export default function Navbar({ currentPage, onNavigate, onLogout, wsStatus }) {
  const [hovered, setHovered] = useState(null);

  const wsColor = {
    connected:    '#22c55e',
    connecting:   '#f59e0b',
    disconnected: '#ef4444',
  }[wsStatus] || '#ef4444';

  const wsLabel = {
    connected:    'live',
    connecting:   'connecting',
    disconnected: 'offline',
  }[wsStatus] || 'offline';

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>⚡</span>
        <div style={styles.logoText}>
          <span style={styles.logoName}>PulseGrid</span>
          <span style={styles.logoSub}>event platform</span>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Page tabs */}
      <div style={styles.tabs}>
        {NAV_PAGES.map(({ id, label, icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              key={id}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
                ...(hovered === id && !isActive ? styles.tabHover : {}),
              }}
              onClick={() => onNavigate(id)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span style={styles.tabIcon}>{icon}</span>
              <span style={styles.tabLabel}>{label}</span>
              {isActive && <div style={styles.tabUnderline} />}
            </button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={styles.right}>
        {/* WS status badge */}
        <div style={styles.wsBadge}>
          <div style={{ ...styles.wsDot, background: wsColor, boxShadow: `0 0 6px ${wsColor}88` }} />
          <span style={{ ...styles.wsLabel, color: wsColor }}>{wsLabel}</span>
        </div>

        <div style={styles.rightDivider} />

        {/* Sign out */}
        <button
          style={{
            ...styles.signOut,
            ...(hovered === 'signout' ? styles.signOutHover : {}),
          }}
          onClick={onLogout}
          onMouseEnter={() => setHovered('signout')}
          onMouseLeave={() => setHovered(null)}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display:        'flex',
    alignItems:     'center',
    gap:            '0',
    padding:        '0 24px',
    height:         '56px',
    background:     '#08080f',
    borderBottom:   '1px solid #14142a',
    position:       'sticky',
    top:            0,
    zIndex:         100,
    fontFamily:     '"JetBrains Mono", "Fira Code", monospace',
    userSelect:     'none',
  },
  logo: {
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
    marginRight:    '24px',
    flexShrink:     0,
  },
  logoIcon: {
    fontSize:       '20px',
    lineHeight:     1,
  },
  logoText: {
    display:        'flex',
    flexDirection:  'column',
    gap:            '1px',
  },
  logoName: {
    fontSize:       '13px',
    fontWeight:     '700',
    color:          '#e8e6f0',
    letterSpacing:  '0.04em',
    lineHeight:     1,
  },
  logoSub: {
    fontSize:       '9px',
    color:          '#2a2a4e',
    letterSpacing:  '0.12em',
    lineHeight:     1,
  },
  divider: {
    width:          '1px',
    height:         '24px',
    background:     '#14142a',
    marginRight:    '20px',
    flexShrink:     0,
  },
  tabs: {
    display:        'flex',
    gap:            '4px',
    flex:           1,
  },
  tab: {
    position:       'relative',
    display:        'flex',
    alignItems:     'center',
    gap:            '6px',
    background:     'transparent',
    border:         'none',
    padding:        '6px 14px',
    fontSize:       '11px',
    fontWeight:     '500',
    cursor:         'pointer',
    borderRadius:   '6px',
    letterSpacing:  '0.05em',
    color:          '#3a3a5c',
    transition:     'color 0.15s, background 0.15s',
    fontFamily:     'inherit',
  },
  tabActive: {
    color:          '#8b9cf4',
    background:     '#10102a',
  },
  tabHover: {
    color:          '#5a5a7c',
    background:     '#0e0e1e',
  },
  tabIcon: {
    fontSize:       '12px',
    lineHeight:     1,
  },
  tabLabel: {
    lineHeight:     1,
  },
  tabUnderline: {
    position:       'absolute',
    bottom:         '-1px',
    left:           '14px',
    right:          '14px',
    height:         '2px',
    background:     '#5b6cf4',
    borderRadius:   '2px 2px 0 0',
    boxShadow:      '0 0 8px #5b6cf488',
  },
  right: {
    display:        'flex',
    alignItems:     'center',
    gap:            '14px',
  },
  wsBadge: {
    display:        'flex',
    alignItems:     'center',
    gap:            '6px',
    padding:        '4px 10px',
    background:     '#0e0e1e',
    border:         '1px solid #14142a',
    borderRadius:   '20px',
  },
  wsDot: {
    width:          '6px',
    height:         '6px',
    borderRadius:   '50%',
    flexShrink:     0,
  },
  wsLabel: {
    fontSize:       '10px',
    fontWeight:     '500',
    letterSpacing:  '0.06em',
  },
  rightDivider: {
    width:          '1px',
    height:         '20px',
    background:     '#14142a',
  },
  signOut: {
    background:     'transparent',
    border:         '1px solid #14142a',
    borderRadius:   '5px',
    color:          '#3a3a5c',
    fontSize:       '10px',
    padding:        '5px 12px',
    cursor:         'pointer',
    letterSpacing:  '0.06em',
    fontFamily:     'inherit',
    transition:     'all 0.15s',
  },
  signOutHover: {
    borderColor:    '#2a2a4e',
    color:          '#5a5a7c',
  },
};