import { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// CONFIRM DIALOG
// Usage: <ConfirmDialog open={open} title="Delete?" message="..." onConfirm={fn} onCancel={fn} danger />
// ═══════════════════════════════════════════════════════════════
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div style={DS.overlay} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div style={DS.dialog} onClick={e => e.stopPropagation()}>
        <div style={DS.dialogHead}>
          <span style={DS.dialogIcon}>{danger ? '⚠' : 'ℹ'}</span>
          <span id="confirm-title" style={DS.dialogTitle}>{title}</span>
        </div>
        <div style={DS.dialogBody}>{message}</div>
        <div style={DS.dialogActions}>
          <button style={DS.cancelBtn} onClick={onCancel} autoFocus={!danger}>
            {cancelLabel}
          </button>
          <button
            style={{ ...DS.confirmBtn, ...(danger ? DS.confirmBtnDanger : DS.confirmBtnAccent) }}
            onClick={onConfirm}
            autoFocus={danger}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// Usage: <EmptyState icon="📭" title="No events" sub="Publish one to get started" action={<button>Publish</button>} />
// ═══════════════════════════════════════════════════════════════
export function EmptyState({ icon = '📭', title, sub, action, style = {} }) {
  return (
    <div style={{ ...ES.wrap, ...style }}>
      <div style={ES.icon}>{icon}</div>
      <div style={ES.title}>{title}</div>
      {sub    && <div style={ES.sub}>{sub}</div>}
      {action && <div style={ES.action}>{action}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR
// Usage: <ProgressBar value={75} max={100} color="#5b6cf4" label="75%" />
// ═══════════════════════════════════════════════════════════════
export function ProgressBar({ value = 0, max = 100, color = '#5b6cf4', label, height = 4, style = {} }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ ...PB.wrap, height, ...style }}>
      <div style={{ ...PB.fill, width:`${pct}%`, background: color, height }} />
      {label && <span style={PB.label}>{label}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// Usage: <AnimatedCounter value={1234} duration={800} style={{}} />
// Smoothly animates from previous value to new value
// ═══════════════════════════════════════════════════════════════
export function AnimatedCounter({ value = 0, duration = 600, format, style = {} }) {
  const [display, setDisplay] = useState(value);
  const prev    = useRef(value);
  const raf     = useRef(null);
  const start   = useRef(null);

  useEffect(() => {
    if (prev.current === value) return;
    const from = prev.current;
    const to   = value;
    prev.current = value;

    cancelAnimationFrame(raf.current);
    start.current = null;

    const animate = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  const formatted = format ? format(display) : display.toLocaleString();
  return <span style={{ ...AC.base, ...style }}>{formatted}</span>;
}

// ═══════════════════════════════════════════════════════════════
// SPINNER
// Usage: <Spinner size={16} color="#5b6cf4" />
// ═══════════════════════════════════════════════════════════════
export function Spinner({ size = 16, color = '#5b6cf4', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation:'spin 0.8s linear infinite', flexShrink:0, ...style }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// BADGE
// Usage: <Badge color="green">delivered</Badge>
// ═══════════════════════════════════════════════════════════════
const BADGE_PRESETS = {
  urgent:    { bg:'#1a0808', border:'#2a1010', color:'#ef4444' },
  normal:    { bg:'#08101a', border:'#10182a', color:'#63b3ed' },
  low:       { bg:'#081408', border:'#101e10', color:'#22c55e' },
  delivered: { bg:'#081408', border:'#101e10', color:'#22c55e' },
  queued:    { bg:'#140e08', border:'#261a10', color:'#f59e0b' },
  failed:    { bg:'#1a0808', border:'#2a1010', color:'#ef4444' },
  critical:  { bg:'#1a0808', border:'#2a1010', color:'#ef4444' },
  warning:   { bg:'#140e08', border:'#261a10', color:'#f59e0b' },
  info:      { bg:'#08101a', border:'#10182a', color:'#63b3ed' },
  success:   { bg:'#081408', border:'#101e10', color:'#22c55e' },
};

export function Badge({ children, preset, style = {} }) {
  const p = BADGE_PRESETS[preset] || BADGE_PRESETS.info;
  return (
    <span style={{
      ...BA.base,
      background:  p.bg,
      border:      `1px solid ${p.border}`,
      color:       p.color,
      ...style,
    }}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// SPARKLINE (mini line chart — no library needed)
// Usage: <Sparkline data={[1,3,2,5,4,7]} width={80} height={24} color="#5b6cf4" />
// ═══════════════════════════════════════════════════════════════
export function Sparkline({ data = [], width = 80, height = 24, color = '#5b6cf4', style = {} }) {
  if (!data.length) return <div style={{ width, height, ...style }} />;

  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;
  const step  = width / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${(data.length-1)*step},${height}`;

  return (
    <svg width={width} height={height} style={{ overflow:'visible', flexShrink:0, ...style }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {data.length > 0 && (
        <circle
          cx={(data.length-1)*step}
          cy={height - ((data[data.length-1] - min) / range) * (height - 2) - 1}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOOLTIP WRAPPER
// Usage: <Tooltip text="Explains this thing"><button>?</button></Tooltip>
// ═══════════════════════════════════════════════════════════════
export function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position:'relative', display:'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span style={{
          ...TT.base,
          ...(position === 'bottom' ? TT.bottom : TT.top),
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// COPY BUTTON
// Usage: <CopyButton text="content to copy" />
// ═══════════════════════════════════════════════════════════════
export function CopyButton({ text, style = {} }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button style={{ ...CP.btn, ...style }} onClick={copy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const DS = {
  overlay:  { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, animation:'fadeIn 150ms ease' },
  dialog:   { background:'#0d0d1a', border:'1px solid #1a1a30', borderRadius:'10px', padding:'24px', width:'360px', boxShadow:'0 24px 80px #000000aa', animation:'slideInUp 150ms ease' },
  dialogHead:{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' },
  dialogIcon:{ fontSize:'16px' },
  dialogTitle:{ fontSize:'13px', fontWeight:'600', color:'#e8e6f0', letterSpacing:'0.03em' },
  dialogBody:{ fontSize:'11px', color:'#5a5a7a', lineHeight:'1.7', letterSpacing:'0.03em', marginBottom:'20px' },
  dialogActions:{ display:'flex', gap:'8px', justifyContent:'flex-end' },
  cancelBtn:{ background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'5px', color:'#5a5a7a', fontSize:'11px', padding:'8px 16px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em' },
  confirmBtn:{ border:'none', borderRadius:'5px', fontSize:'11px', fontWeight:'600', padding:'8px 16px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em' },
  confirmBtnAccent:{ background:'#5b6cf4', color:'#fff', boxShadow:'0 4px 12px #5b6cf433' },
  confirmBtnDanger:{ background:'#ef4444', color:'#fff', boxShadow:'0 4px 12px #ef444433' },
};

const ES = {
  wrap:   { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'8px', padding:'32px', fontFamily:'"JetBrains Mono","Fira Code",monospace' },
  icon:   { fontSize:'36px', opacity:0.4, marginBottom:'6px' },
  title:  { fontSize:'12px', fontWeight:'600', color:'#3a3a5c', letterSpacing:'0.05em' },
  sub:    { fontSize:'10px', color:'#2a2a4e', letterSpacing:'0.04em', textAlign:'center', maxWidth:'260px', lineHeight:'1.6' },
  action: { marginTop:'8px' },
};

const PB = {
  wrap:  { background:'#0e0e1e', borderRadius:'2px', overflow:'hidden', position:'relative' },
  fill:  { borderRadius:'2px', transition:'width 0.4s ease' },
  label: { position:'absolute', right:0, top:'-18px', fontSize:'9px', color:'#3a3a5c', letterSpacing:'0.06em' },
};

const AC = {
  base: { fontFamily:'"JetBrains Mono","Fira Code",monospace', fontVariantNumeric:'tabular-nums' },
};

const BA = {
  base: { display:'inline-block', fontSize:'9px', padding:'2px 8px', borderRadius:'4px', letterSpacing:'0.06em', fontWeight:'600', fontFamily:'"JetBrains Mono","Fira Code",monospace' },
};

const TT = {
  base:   { position:'absolute', left:'50%', transform:'translateX(-50%)', background:'#0d0d1a', border:'1px solid #1a1a2e', borderRadius:'5px', padding:'5px 9px', fontSize:'10px', color:'#a0a0c0', whiteSpace:'nowrap', zIndex:100, letterSpacing:'0.03em', boxShadow:'0 4px 12px #00000066', pointerEvents:'none' },
  top:    { bottom:'calc(100% + 6px)' },
  bottom: { top:'calc(100% + 6px)' },
};

const CP = {
  btn: { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'4px', color:'#3a3a5c', fontSize:'9px', padding:'3px 10px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.05em', transition:'all 0.15s' },
};