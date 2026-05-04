import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const SECTIONS = [
  { id:'account',       label:'Account',       icon:'👤' },
  { id:'security',      label:'Security',      icon:'🔐' },
  { id:'notifications', label:'Notifications', icon:'🔔' },
  { id:'display',       label:'Display',       icon:'🎨' },
];

export default function UserSettings({ token }) {
  const [section, setSection] = useState('account');
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [flash,   setFlash]   = useState(null);

  // Account form
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [saving,   setSaving]   = useState(false);

  // Security form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,      setNewPw]     = useState('');
  const [confirmPw,  setConfirmPw] = useState('');
  const [pwSaving,   setPwSaving]  = useState(false);

  // Notification prefs (stored in localStorage)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pg_notif_prefs') || '{}');
    } catch { return {}; }
  });

  // Display prefs
  const [displayPrefs, setDisplayPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pg_display_prefs') || '{"feedLimit":50,"autoScroll":true,"showReplayed":true,"dateFormat":"relative"}');
    } catch { return { feedLimit:50, autoScroll:true, showReplayed:true, dateFormat:'relative' }; }
  });

  const headers = { Authorization: `Bearer ${token}` };

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 3000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${config.API_BASE}/auth/me`, { headers });
        setUser(res.data.user);
        setUsername(res.data.user.username || '');
        setEmail(res.data.user.email || '');
      } catch (err) {
        console.error('[UserSettings] fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const saveAccount = async () => {
    if (!username.trim()) { showFlash('error', 'Username cannot be empty'); return; }
    setSaving(true);
    try {
      // Note: your backend may need a PATCH /api/auth/profile endpoint
      await axios.patch(`${config.API_BASE}/auth/profile`,
        { username: username.trim() }, { headers }
      );
      showFlash('success', 'Account updated');
    } catch (err) {
      showFlash('error', err.response?.data?.error || 'Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { showFlash('error', 'All fields required'); return; }
    if (newPw.length < 8) { showFlash('error', 'New password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { showFlash('error', 'Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await axios.patch(`${config.API_BASE}/auth/password`,
        { currentPassword: currentPw, newPassword: newPw }, { headers }
      );
      showFlash('success', 'Password changed successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      showFlash('error', err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const updateNotifPref = (key, val) => {
    const updated = { ...notifPrefs, [key]: val };
    setNotifPrefs(updated);
    localStorage.setItem('pg_notif_prefs', JSON.stringify(updated));
    showFlash('success', 'Preference saved');
  };

  const updateDisplayPref = (key, val) => {
    const updated = { ...displayPrefs, [key]: val };
    setDisplayPrefs(updated);
    localStorage.setItem('pg_display_prefs', JSON.stringify(updated));
    showFlash('success', 'Preference saved');
  };

  return (
    <div style={S.page}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sideTitle}>Settings</div>
        {SECTIONS.map(sec => (
          <button
            key={sec.id}
            style={{ ...S.sideBtn, ...(section === sec.id ? S.sideBtnActive : {}) }}
            onClick={() => setSection(sec.id)}
          >
            <span style={S.sideBtnIcon}>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}

        {flash && (
          <div style={{
            ...S.flash,
            color:      flash.type === 'success' ? '#22c55e' : '#ef4444',
            background: flash.type === 'success' ? '#08140a' : '#140808',
            border:     `1px solid ${flash.type === 'success' ? '#22c55e33' : '#ef444433'}`,
            marginTop:  'auto',
          }}>
            {flash.type === 'success' ? '✓' : '✕'} {flash.text}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={S.main}>

        {/* ── ACCOUNT ── */}
        {section === 'account' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Account Information</div>
            <div style={S.sectionSub}>Your profile details and account info</div>

            {loading ? (
              <div style={S.loadMsg}>Loading account info...</div>
            ) : (
              <>
                <div style={S.infoCard}>
                  <div style={S.infoRow}>
                    <span style={S.infoLabel}>User ID</span>
                    <span style={{ ...S.infoVal, fontFamily:'monospace', fontSize:'11px' }}>{user?.id || '—'}</span>
                  </div>
                  <div style={S.infoRow}>
                    <span style={S.infoLabel}>Joined</span>
                    <span style={S.infoVal}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>

                <div style={S.formSection}>
                  <div style={S.formTitle}>Edit Profile</div>
                  <FormField
                    label="Username"
                    value={username}
                    onChange={setUsername}
                    placeholder="your_username"
                  />
                  <FormField
                    label="Email"
                    value={email}
                    onChange={() => {}}
                    placeholder="you@example.com"
                    disabled
                    hint="Email cannot be changed"
                  />
                  <button
                    style={{ ...S.saveBtn, opacity: saving ? 0.6 : 1 }}
                    onClick={saveAccount}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>

                <div style={S.dangerZone}>
                  <div style={S.dangerTitle}>Danger Zone</div>
                  <div style={S.dangerRow}>
                    <div>
                      <div style={S.dangerLabel}>Delete account</div>
                      <div style={S.dangerHint}>Permanently delete your account and all data. This cannot be undone.</div>
                    </div>
                    <button
                      style={S.dangerBtn}
                      onClick={() => showFlash('error', 'Account deletion is disabled in demo mode')}
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SECURITY ── */}
        {section === 'security' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Security</div>
            <div style={S.sectionSub}>Change your password and manage access</div>

            <div style={S.formSection}>
              <div style={S.formTitle}>Change Password</div>
              <FormField label="Current password" value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" />
              <FormField label="New password"     value={newPw}     onChange={setNewPw}     type="password" placeholder="Min 8 characters" />
              <FormField label="Confirm password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Repeat new password"
                onKeyDown={e => e.key === 'Enter' && savePassword()} />
              <button
                style={{ ...S.saveBtn, opacity: pwSaving ? 0.6 : 1 }}
                onClick={savePassword}
                disabled={pwSaving}
              >
                {pwSaving ? 'Changing...' : 'Change password'}
              </button>
            </div>

            <div style={S.infoCard}>
              <div style={S.formTitle}>Session Info</div>
              <div style={S.infoRow}>
                <span style={S.infoLabel}>Auth method</span>
                <span style={S.infoVal}>JWT · 7 day expiry</span>
              </div>
              <div style={S.infoRow}>
                <span style={S.infoLabel}>Password hashing</span>
                <span style={S.infoVal}>bcrypt · 12 salt rounds</span>
              </div>
              <div style={S.infoRow}>
                <span style={S.infoLabel}>Token storage</span>
                <span style={S.infoVal}>localStorage (client side)</span>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {section === 'notifications' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Notification Preferences</div>
            <div style={S.sectionSub}>Control what alerts you see in the dashboard</div>

            {[
              {
                title:   'Anomaly Alerts',
                sub:     'Show banner when Z-score spike is detected',
                key:     'anomalyAlerts',
                default: true,
              },
              {
                title:   'Critical Only',
                sub:     'Only show notifications for critical severity (Z≥3.0)',
                key:     'criticalOnly',
                default: false,
              },
              {
                title:   'Offline Sync Banner',
                sub:     'Show sync progress when reconnecting after offline',
                key:     'syncBanner',
                default: true,
              },
              {
                title:   'Queue Alert',
                sub:     'Show warning when any queue depth exceeds 100 jobs',
                key:     'queueAlert',
                default: false,
              },
              {
                title:   'Sound Alerts',
                sub:     'Play a sound on critical anomaly detection',
                key:     'soundAlerts',
                default: false,
              },
            ].map(pref => {
              const val = notifPrefs[pref.key] !== undefined ? notifPrefs[pref.key] : pref.default;
              return (
                <div key={pref.key} style={S.prefRow}>
                  <div style={S.prefLeft}>
                    <div style={S.prefTitle}>{pref.title}</div>
                    <div style={S.prefSub}>{pref.sub}</div>
                  </div>
                  <div
                    style={{ ...S.toggle, background: val ? '#5b6cf4' : '#14142a' }}
                    onClick={() => updateNotifPref(pref.key, !val)}
                  >
                    <div style={{ ...S.toggleThumb, transform: val ? 'translateX(18px)' : 'translateX(2px)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── DISPLAY ── */}
        {section === 'display' && (
          <div style={S.section}>
            <div style={S.sectionTitle}>Display Preferences</div>
            <div style={S.sectionSub}>Customize how PulseGrid looks and behaves</div>

            {/* Feed limit */}
            <div style={S.prefRow}>
              <div style={S.prefLeft}>
                <div style={S.prefTitle}>Live feed limit</div>
                <div style={S.prefSub}>Max events shown in the live feed panel</div>
              </div>
              <select
                style={S.select}
                value={displayPrefs.feedLimit}
                onChange={e => updateDisplayPref('feedLimit', parseInt(e.target.value))}
              >
                {[25,50,100,200].map(n => (
                  <option key={n} value={n}>{n} events</option>
                ))}
              </select>
            </div>

            {/* Auto scroll */}
            <div style={S.prefRow}>
              <div style={S.prefLeft}>
                <div style={S.prefTitle}>Auto-scroll feed</div>
                <div style={S.prefSub}>Automatically scroll to newest events in the live feed</div>
              </div>
              <div
                style={{ ...S.toggle, background: displayPrefs.autoScroll ? '#5b6cf4' : '#14142a' }}
                onClick={() => updateDisplayPref('autoScroll', !displayPrefs.autoScroll)}
              >
                <div style={{ ...S.toggleThumb, transform: displayPrefs.autoScroll ? 'translateX(18px)' : 'translateX(2px)' }} />
              </div>
            </div>

            {/* Show replayed */}
            <div style={S.prefRow}>
              <div style={S.prefLeft}>
                <div style={S.prefTitle}>Show replayed events</div>
                <div style={S.prefSub}>Display offline sync replayed events in the feed</div>
              </div>
              <div
                style={{ ...S.toggle, background: displayPrefs.showReplayed ? '#5b6cf4' : '#14142a' }}
                onClick={() => updateDisplayPref('showReplayed', !displayPrefs.showReplayed)}
              >
                <div style={{ ...S.toggleThumb, transform: displayPrefs.showReplayed ? 'translateX(18px)' : 'translateX(2px)' }} />
              </div>
            </div>

            {/* Date format */}
            <div style={S.prefRow}>
              <div style={S.prefLeft}>
                <div style={S.prefTitle}>Date format</div>
                <div style={S.prefSub}>How timestamps are displayed across the app</div>
              </div>
              <select
                style={S.select}
                value={displayPrefs.dateFormat}
                onChange={e => updateDisplayPref('dateFormat', e.target.value)}
              >
                <option value="relative">Relative (2 min ago)</option>
                <option value="short">Short (Dec 12, 14:30)</option>
                <option value="iso">ISO 8601</option>
              </select>
            </div>

            <div style={S.resetRow}>
              <button
                style={S.resetBtn}
                onClick={() => {
                  const defaults = { feedLimit:50, autoScroll:true, showReplayed:true, dateFormat:'relative' };
                  setDisplayPrefs(defaults);
                  localStorage.setItem('pg_display_prefs', JSON.stringify(defaults));
                  showFlash('success', 'Display preferences reset');
                }}
              >
                Reset to defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type='text', placeholder, disabled, hint, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:'14px' }}>
      <label style={fS.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...fS.input,
          borderColor: disabled ? '#0e0e1e' : focused ? '#5b6cf4' : '#14142a',
          opacity:     disabled ? 0.5 : 1,
          boxShadow:   focused && !disabled ? '0 0 0 2px #5b6cf422' : 'none',
        }}
      />
      {hint && <div style={fS.hint}>{hint}</div>}
    </div>
  );
}
const fS = {
  label: { display:'block', fontSize:'10px', color:'#3a3a5c', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' },
  input: { width:'100%', background:'#080810', border:'1px solid', borderRadius:'5px', padding:'9px 12px', color:'#e8e6f0', fontSize:'12px', outline:'none', fontFamily:'inherit', transition:'border-color 0.15s, box-shadow 0.15s' },
  hint:  { fontSize:'10px', color:'#2a2a4e', marginTop:'4px', letterSpacing:'0.04em' },
};

const S = {
  page:         { display:'grid', gridTemplateColumns:'200px 1fr', gap:'1px', height:'calc(100vh - 52px)', background:'#14142a', fontFamily:'"JetBrains Mono","Fira Code",monospace', overflow:'hidden' },
  sidebar:      { background:'#08080f', padding:'20px 14px', display:'flex', flexDirection:'column', gap:'4px' },
  sideTitle:    { fontSize:'10px', fontWeight:'600', color:'#2a2a4e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'10px', paddingLeft:'8px' },
  sideBtn:      { display:'flex', alignItems:'center', gap:'8px', background:'transparent', border:'none', borderRadius:'5px', color:'#3a3a5c', fontSize:'11px', padding:'8px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em', textAlign:'left', transition:'all 0.12s' },
  sideBtnActive:{ background:'#10102a', color:'#8b9cf4' },
  sideBtnIcon:  { fontSize:'13px', lineHeight:1, minWidth:'16px' },
  flash:        { padding:'8px 10px', borderRadius:'5px', fontSize:'10px', letterSpacing:'0.04em', border:'1px solid', marginTop:'16px' },
  main:         { background:'#08080f', padding:'28px 32px', overflowY:'auto' },
  section:      { maxWidth:'560px' },
  sectionTitle: { fontSize:'15px', fontWeight:'600', color:'#e8e6f0', letterSpacing:'0.03em', marginBottom:'4px' },
  sectionSub:   { fontSize:'11px', color:'#3a3a5c', letterSpacing:'0.04em', marginBottom:'24px' },
  loadMsg:      { fontSize:'11px', color:'#3a3a5c', letterSpacing:'0.05em' },
  infoCard:     { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'8px', padding:'16px', marginBottom:'20px' },
  infoRow:      { display:'flex', gap:'16px', padding:'6px 0', borderBottom:'1px solid #0a0a14', alignItems:'center' },
  infoLabel:    { fontSize:'10px', color:'#3a3a5c', textTransform:'uppercase', letterSpacing:'0.08em', minWidth:'120px' },
  infoVal:      { fontSize:'11px', color:'#a0a0c0', letterSpacing:'0.03em' },
  formSection:  { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'8px', padding:'16px 18px', marginBottom:'20px' },
  formTitle:    { fontSize:'11px', fontWeight:'600', color:'#5a5a7a', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px' },
  saveBtn:      { background:'#5b6cf4', border:'none', borderRadius:'6px', padding:'10px 20px', color:'#fff', fontSize:'11px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em', marginTop:'4px', boxShadow:'0 4px 16px #5b6cf422', transition:'opacity 0.15s' },
  dangerZone:   { background:'#140808', border:'1px solid #2a1010', borderRadius:'8px', padding:'16px 18px' },
  dangerTitle:  { fontSize:'10px', fontWeight:'600', color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' },
  dangerRow:    { display:'flex', justifyContent:'space-between', alignItems:'center', gap:'16px' },
  dangerLabel:  { fontSize:'11px', color:'#e8e6f0', marginBottom:'3px' },
  dangerHint:   { fontSize:'10px', color:'#4a2a2a', letterSpacing:'0.03em' },
  dangerBtn:    { background:'transparent', border:'1px solid #ef444444', borderRadius:'5px', color:'#ef4444', fontSize:'10px', padding:'6px 14px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em', flexShrink:0 },
  prefRow:      { display:'flex', justifyContent:'space-between', alignItems:'center', gap:'20px', padding:'14px 0', borderBottom:'1px solid #0e0e1e' },
  prefLeft:     { flex:1 },
  prefTitle:    { fontSize:'12px', color:'#a0a0c0', marginBottom:'3px', letterSpacing:'0.03em' },
  prefSub:      { fontSize:'10px', color:'#3a3a5c', letterSpacing:'0.04em' },
  toggle:       { width:'38px', height:'22px', borderRadius:'11px', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 },
  toggleThumb:  { position:'absolute', top:'2px', width:'18px', height:'18px', borderRadius:'50%', background:'#fff', transition:'transform 0.2s', boxShadow:'0 1px 4px #00000044' },
  select:       { background:'#0d0d1a', border:'1px solid #14142a', borderRadius:'5px', padding:'6px 10px', color:'#e8e6f0', fontSize:'11px', outline:'none', fontFamily:'inherit', cursor:'pointer' },
  resetRow:     { paddingTop:'14px' },
  resetBtn:     { background:'none', border:'1px solid #14142a', borderRadius:'5px', color:'#3a3a5c', fontSize:'10px', padding:'6px 14px', cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.04em' },
};