/**
 * Skeleton loaders — used during data fetching.
 * Matches the dark monospace design system.
 */

// ── Base skeleton block ───────────────────────────────────────────
function Skeleton({ width = '100%', height = '12px', borderRadius = '4px', style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background:  'linear-gradient(90deg, #0d0d1a 25%, #14142a 50%, #0d0d1a 75%)',
      backgroundSize: '200% 100%',
      animation:   'shimmer 1.4s infinite',
      flexShrink:  0,
      ...style,
    }} />
  );
}

// ── Stat card skeleton ────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div style={S.card}>
      <Skeleton width="60%" height="10px" style={{ marginBottom:'10px' }} />
      <Skeleton width="40%" height="28px" style={{ marginBottom:'6px' }} />
      <Skeleton width="50%" height="9px" />
    </div>
  );
}

// ── Table row skeleton ────────────────────────────────────────────
export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding:'12px 14px' }}>
          <Skeleton width={`${60 + (i * 7) % 40}%`} height="10px" />
        </td>
      ))}
    </tr>
  );
}

// ── Event feed item skeleton ──────────────────────────────────────
export function FeedItemSkeleton() {
  return (
    <div style={S.feedItem}>
      <div style={{ display:'flex', gap:'8px', marginBottom:'6px' }}>
        <Skeleton width="80px" height="9px" />
        <Skeleton width="50px" height="14px" borderRadius="4px" />
      </div>
      <Skeleton width="100%" height="10px" />
    </div>
  );
}

// ── Subscription card skeleton ────────────────────────────────────
export function SubCardSkeleton() {
  return (
    <div style={S.subCard}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
        <Skeleton width="7px" height="7px" borderRadius="50%" />
        <Skeleton width="60%" height="12px" />
        <Skeleton width="70px" height="22px" borderRadius="4px" style={{ marginLeft:'auto' }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Skeleton width="80px" height="9px" />
        <Skeleton width="70px" height="9px" />
      </div>
      <Skeleton width="100%" height="2px" style={{ marginTop:'10px' }} />
    </div>
  );
}

// ── Anomaly item skeleton ─────────────────────────────────────────
export function AnomalyItemSkeleton() {
  return (
    <div style={S.anomalyItem}>
      <Skeleton width="36px" height="36px" borderRadius="8px" style={{ flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
          <Skeleton width="60px" height="9px" />
          <Skeleton width="100px" height="11px" />
        </div>
        <div style={{ display:'flex', gap:'16px' }}>
          {[60,50,55,50].map((w,i) => (
            <div key={i}>
              <Skeleton width={`${w}px`} height="8px" style={{ marginBottom:'4px' }} />
              <Skeleton width={`${w-10}px`} height="12px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Queue card skeleton ───────────────────────────────────────────
export function QueueCardSkeleton() {
  return (
    <div style={S.card}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
        <Skeleton width="50px" height="11px" />
        <Skeleton width="30px" height="20px" />
      </div>
      <Skeleton width="100%" height="3px" style={{ marginBottom:'12px' }} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
        {[1,2,3,4].map(i => (
          <div key={i}>
            <Skeleton width="60px" height="8px" style={{ marginBottom:'4px' }} />
            <Skeleton width="40px" height="14px" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Topic row skeleton ────────────────────────────────────────────
export function TopicRowSkeleton() {
  return (
    <div style={S.topicRow}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:'200px' }}>
        <Skeleton width="7px" height="7px" borderRadius="50%" />
        <Skeleton width="120px" height="12px" />
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:'12px' }}>
        <Skeleton width="100%" height="3px" />
        <Skeleton width="80px" height="9px" />
      </div>
      <div style={{ display:'flex', gap:'6px' }}>
        <Skeleton width="60px" height="26px" borderRadius="4px" />
        <Skeleton width="80px" height="26px" borderRadius="4px" />
      </div>
    </div>
  );
}

// ── Full page loading ─────────────────────────────────────────────
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={S.pageLoader}>
      <div style={S.loaderDots}>
        {[0,1,2].map(i => (
          <div
            key={i}
            style={{
              ...S.dot,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <div style={S.loaderMsg}>{message}</div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const S = {
  card: {
    background:  '#0d0d1a',
    border:      '1px solid #14142a',
    borderRadius:'8px',
    padding:     '16px',
  },
  feedItem: {
    background:  '#0d0d1a',
    border:      '1px solid #14142a',
    borderRadius:'6px',
    padding:     '10px 12px',
  },
  subCard: {
    background:  '#0d0d1a',
    border:      '1px solid #14142a',
    borderRadius:'8px',
    padding:     '14px 16px',
  },
  anomalyItem: {
    display:    'flex',
    gap:        '12px',
    background: '#0d0d1a',
    border:     '1px solid #14142a',
    borderRadius:'8px',
    padding:    '14px 16px',
  },
  topicRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        '16px',
    background: '#0d0d1a',
    border:     '1px solid #14142a',
    borderRadius:'8px',
    padding:    '12px 16px',
  },
  pageLoader: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    height:         '100%',
    gap:            '12px',
    fontFamily:     '"JetBrains Mono","Fira Code",monospace',
  },
  loaderDots: {
    display:        'flex',
    gap:            '6px',
  },
  dot: {
    width:          '7px',
    height:         '7px',
    borderRadius:   '50%',
    background:     '#5b6cf4',
    animation:      'dotPulse 1.2s ease-in-out infinite',
  },
  loaderMsg: {
    fontSize:       '11px',
    color:          '#3a3a5c',
    letterSpacing:  '0.06em',
  },
};

// ── Global keyframes (inject once) ───────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('pg-skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'pg-skeleton-styles';
  style.textContent = `
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes dotPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40%            { transform: scale(1);   opacity: 1;   }
    }
    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}