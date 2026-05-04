import { useState, useCallback, useRef, createContext, useContext } from 'react';

// ── Context ───────────────────────────────────────────────────────
const ToastContext = createContext(null);

let toastIdCounter = 0;

// ── Provider ──────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type, message, duration = 3500) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev.slice(-4), { id, type, message }]); // max 5 at once
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = {
    success: (msg, d) => toast('success', msg, d),
    error:   (msg, d) => toast('error',   msg, d),
    info:    (msg, d) => toast('info',    msg, d),
    warning: (msg, d) => toast('warning', msg, d),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

// ── Toast container ───────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={S.container} aria-live="polite" aria-label="Notifications">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const cfg = CONFIGS[toast.type] || CONFIGS.info;
  return (
    <div style={{ ...S.toast, borderColor: cfg.border, background: cfg.bg }}>
      <span style={S.icon}>{cfg.icon}</span>
      <span style={{ ...S.message, color: cfg.color }}>{toast.message}</span>
      <button
        style={S.closeBtn}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

// ── Config ────────────────────────────────────────────────────────
const CONFIGS = {
  success: { icon:'✓', color:'#22c55e', bg:'#08140a', border:'#22c55e44' },
  error:   { icon:'✕', color:'#ef4444', bg:'#140808', border:'#ef444444' },
  info:    { icon:'ℹ', color:'#63b3ed', bg:'#08101a', border:'#63b3ed44' },
  warning: { icon:'⚠', color:'#f59e0b', bg:'#140e08', border:'#f59e0b44' },
};

// ── Styles ────────────────────────────────────────────────────────
const S = {
  container: {
    position:    'fixed',
    bottom:      '20px',
    right:       '20px',
    zIndex:      9999,
    display:     'flex',
    flexDirection:'column',
    gap:         '8px',
    pointerEvents:'none',
    fontFamily:  '"JetBrains Mono","Fira Code",monospace',
  },
  toast: {
    display:     'flex',
    alignItems:  'center',
    gap:         '10px',
    padding:     '10px 14px',
    borderRadius:'7px',
    border:      '1px solid',
    minWidth:    '260px',
    maxWidth:    '380px',
    boxShadow:   '0 8px 32px #00000066',
    pointerEvents:'all',
    animation:   'slideIn 0.2s ease',
  },
  icon:     { fontSize:'12px', flexShrink:0 },
  message:  { flex:1, fontSize:'11px', letterSpacing:'0.03em', lineHeight:'1.4' },
  closeBtn: {
    background:  'none',
    border:      'none',
    color:       '#3a3a5c',
    fontSize:    '10px',
    cursor:      'pointer',
    padding:     '0 2px',
    flexShrink:  0,
    fontFamily:  'inherit',
  },
};