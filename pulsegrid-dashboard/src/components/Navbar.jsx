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
    <nav style={styles.nav} role="navigation" aria-label="Primary application navigation">
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
              type="button"
              key={id}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
                ...(hovered === id && !isActive ? styles.tabHover : {}),
              }}
              onClick={() => onNavigate(id)}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              aria-current={isActive ? 'page' : undefined}
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
          type="button"
          style={{
            ...styles.signOut,
            ...(hovered === 'signout' ? styles.signOutHover : {}),
          }}
          onClick={onLogout}
          onMouseEnter={() => setHovered('signout')}
          onMouseLeave={() => setHovered(null)}
          aria-label="Sign out"
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
    minHeight:      '64px',
    background:     'rgba(8, 10, 18, 0.96)',
    borderBottom:   '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow:      '0 18px 40px rgba(0, 0, 0, 0.18)',
    position:       'sticky',
    top:            0,
    zIndex:         100,
    fontFamily:     'Inter, system-ui, sans-serif',
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
    color:          '#94949c',
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
    gap:            '10px',
    flex:           1,
  },
  tab: {
    position:       'relative',
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    background:     'transparent',
    border:         'none',
    padding:        '10px 16px',
    fontSize:       '12px',
    fontWeight:     '600',
    cursor:         'pointer',
    borderRadius:   '12px',
    letterSpacing:  '0.08em',
    color:          '#cbd5e1',
    transition:     'all 0.2s ease',
    fontFamily:     'inherit',
  },
  tabActive: {
    color:          '#eff6ff',
    background:     'rgba(91, 108, 244, 0.16)',
    boxShadow:      '0 0 0 1px rgba(91, 108, 244, 0.14)',
  },
  tabHover: {
    color:          '#e2e8f0',
    background:     'rgba(255, 255, 255, 0.04)',
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
    gap:            '8px',
    padding:        '6px 12px',
    background:     'rgba(91, 108, 244, 0.12)',
    borderRadius:   '999px',
    border:         '1px solid rgba(91, 108, 244, 0.18)',
  },
  wsDot: {
    width:          '8px',
    height:         '8px',
    borderRadius:   '50%',
    flexShrink:     0,
  },
  wsLabel: {
    fontSize:       '10px',
    fontWeight:     '700',
    letterSpacing:  '0.08em',
    color:          '#eff6ff',
    textTransform:  'uppercase',
  },
  rightDivider: {
    width:          '1px',
    height:         '20px',
    background:     'rgba(255, 255, 255, 0.08)',
  },
  signOut: {
    background:     'transparent',
    border:         '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius:   '999px',
    color:          '#cbd5e1',
    fontSize:       '11px',
    padding:        '8px 14px',
    cursor:         'pointer',
    letterSpacing:  '0.08em',
    fontFamily:     'inherit',
    transition:     'all 0.2s ease',
  },
  signOutHover: {
    borderColor:    '#5b6cf4',
    background:     'rgba(91, 108, 244, 0.12)',
    color:          '#eff6ff',
  },
};