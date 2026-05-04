import { useState } from 'react';
import axios from 'axios';
import config from '../config';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) { setError('Both fields are required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${config.API_BASE}/auth/login`, { email, password });
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Background grid texture */}
      <div style={S.grid} aria-hidden="true" />

      <div style={S.card}>
        {/* Logo */}
        <div style={S.header}>
          <div style={S.logo}>⚡ PulseGrid</div>
          <div style={S.subtitle}>Sign in to your account</div>
        </div>

        {/* Email */}
        <div style={S.fieldWrap}>
          <label style={S.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="you@example.com"
            autoFocus
            style={{
              ...S.input,
              borderColor: focusedField === 'email' ? '#5b6cf4' : '#14142a',
              boxShadow:   focusedField === 'email' ? '0 0 0 2px #5b6cf422' : 'none',
            }}
          />
        </div>

        {/* Password */}
        <div style={S.fieldWrap}>
          <label style={S.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••"
            style={{
              ...S.input,
              borderColor: focusedField === 'password' ? '#5b6cf4' : '#14142a',
              boxShadow:   focusedField === 'password' ? '0 0 0 2px #5b6cf422' : 'none',
            }}
          />
        </div>

        {error && <div style={S.error}>{error}</div>}

        <button
          style={{ ...S.btn, opacity: loading ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>

        <div style={S.footer}>
          Don't have an account?{' '}
          <button style={S.link} onClick={onSwitchToRegister}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight:      '100vh',
    background:     '#08080f',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontFamily:     '"JetBrains Mono", "Fira Code", monospace',
    position:       'relative',
    overflow:       'hidden',
  },
  grid: {
    position:       'absolute',
    inset:          0,
    backgroundImage: `
      linear-gradient(#14142a 1px, transparent 1px),
      linear-gradient(90deg, #14142a 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    opacity:        0.4,
    pointerEvents:  'none',
    zIndex:         0,
  },
  card: {
    position:       'relative',
    zIndex:         1,
    background:     '#0d0d1a',
    border:         '1px solid #1a1a30',
    borderRadius:   '12px',
    padding:        '36px',
    width:          '380px',
    boxShadow:      '0 24px 80px #00000080, 0 0 0 1px #5b6cf41a',
  },
  header: {
    marginBottom:   '28px',
  },
  logo: {
    fontSize:       '18px',
    fontWeight:     '700',
    color:          '#e8e6f0',
    letterSpacing:  '0.04em',
    marginBottom:   '6px',
  },
  subtitle: {
    fontSize:       '11px',
    color:          '#3a3a5c',
    letterSpacing:  '0.08em',
  },
  fieldWrap: {
    marginBottom:   '14px',
  },
  label: {
    display:        'block',
    fontSize:       '10px',
    color:          '#3a3a5c',
    letterSpacing:  '0.1em',
    textTransform:  'uppercase',
    marginBottom:   '6px',
  },
  input: {
    width:          '100%',
    background:     '#080810',
    border:         '1px solid #14142a',
    borderRadius:   '6px',
    padding:        '10px 12px',
    color:          '#e8e6f0',
    fontSize:       '12px',
    outline:        'none',
    transition:     'border-color 0.15s, box-shadow 0.15s',
    fontFamily:     'inherit',
  },
  error: {
    fontSize:       '11px',
    color:          '#ef4444',
    background:     '#1a0808',
    border:         '1px solid #2a1010',
    borderRadius:   '6px',
    padding:        '9px 12px',
    marginBottom:   '12px',
    letterSpacing:  '0.03em',
  },
  btn: {
    width:          '100%',
    background:     '#5b6cf4',
    border:         'none',
    borderRadius:   '7px',
    padding:        '12px',
    color:          '#fff',
    fontSize:       '12px',
    fontWeight:     '600',
    cursor:         'pointer',
    letterSpacing:  '0.04em',
    fontFamily:     'inherit',
    transition:     'opacity 0.15s',
    boxShadow:      '0 4px 20px #5b6cf433',
  },
  footer: {
    marginTop:      '20px',
    fontSize:       '11px',
    color:          '#3a3a5c',
    textAlign:      'center',
    letterSpacing:  '0.03em',
  },
  link: {
    background:     'none',
    border:         'none',
    color:          '#8b9cf4',
    cursor:         'pointer',
    fontSize:       '11px',
    fontFamily:     'inherit',
    textDecoration: 'underline',
    letterSpacing:  '0.03em',
  },
};