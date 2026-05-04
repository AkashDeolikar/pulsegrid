import { useState } from 'react';
import axios from 'axios';
import config from '../config';

export default function Register({ onRegister, onSwitchToLogin }) {
  const [form, setForm]       = useState({ email: '', username: '', password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const update = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email)                      errs.email    = 'Required';
    else if (!emailRx.test(form.email))   errs.email    = 'Invalid email';
    if (!form.username)                   errs.username = 'Required';
    else if (form.username.length < 3)    errs.username = 'Min 3 characters';
    if (!form.password)                   errs.password = 'Required';
    else if (form.password.length < 8)    errs.password = 'Min 8 characters';
    if (form.password !== form.confirm)   errs.confirm  = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await axios.post(`${config.API_BASE}/auth/register`, {
        email:    form.email,
        username: form.username,
        password: form.password,
      });
      onRegister(res.data.token);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.logo}>⚡ PulseGrid</div>
          <div style={S.subtitle}>Create your account</div>
        </div>

        {/* Form */}
        <div style={S.form}>
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoFocus
          />
          <Field
            label="Username"
            type="text"
            value={form.username}
            onChange={update('username')}
            error={errors.username}
            placeholder="akash_dev"
          />
          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={update('password')}
                error={errors.password}
                placeholder="Min 8 chars"
              />
            </div>
            <div style={{ flex: 1 }}>
              <Field
                label="Confirm"
                type="password"
                value={form.confirm}
                onChange={update('confirm')}
                error={errors.confirm}
                placeholder="Repeat password"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {apiError && (
            <div style={S.apiError}>{apiError}</div>
          )}

          <button
            style={{ ...S.btn, opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </div>

        {/* Footer */}
        <div style={S.footer}>
          Already have an account?{' '}
          <button style={S.link} onClick={onSwitchToLogin}>
            Sign in
          </button>
        </div>
      </div>

      {/* Background grid */}
      <div style={S.grid} aria-hidden="true" />
    </div>
  );
}

function Field({ label, type, value, onChange, error, placeholder, autoFocus, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...S.input,
          borderColor: error ? '#ef4444' : focused ? '#5b6cf4' : '#14142a',
          boxShadow:   error ? '0 0 0 2px #ef444422' : focused ? '0 0 0 2px #5b6cf422' : 'none',
        }}
      />
      {error && <div style={S.fieldError}>{error}</div>}
    </div>
  );
}

const S = {
  page: {
    minHeight:        '100vh',
    background:       '#08080f',
    display:          'flex',
    alignItems:       'center',
    justifyContent:   'center',
    fontFamily:       '"JetBrains Mono", "Fira Code", monospace',
    position:         'relative',
    overflow:         'hidden',
  },
  grid: {
    position:         'absolute',
    inset:            0,
    backgroundImage:  `
      linear-gradient(#14142a 1px, transparent 1px),
      linear-gradient(90deg, #14142a 1px, transparent 1px)
    `,
    backgroundSize:   '40px 40px',
    opacity:          0.4,
    pointerEvents:    'none',
    zIndex:           0,
  },
  card: {
    position:         'relative',
    zIndex:           1,
    background:       '#0d0d1a',
    border:           '1px solid #1a1a30',
    borderRadius:     '12px',
    padding:          '36px',
    width:            '440px',
    boxShadow:        '0 24px 80px #00000080, 0 0 0 1px #5b6cf41a',
  },
  header: {
    marginBottom:     '28px',
  },
  logo: {
    fontSize:         '18px',
    fontWeight:       '700',
    color:            '#e8e6f0',
    letterSpacing:    '0.04em',
    marginBottom:     '6px',
  },
  subtitle: {
    fontSize:         '11px',
    color:            '#3a3a5c',
    letterSpacing:    '0.08em',
  },
  form: {
    display:          'flex',
    flexDirection:    'column',
    gap:              '4px',
  },
  row: {
    display:          'flex',
    gap:              '12px',
  },
  fieldWrap: {
    display:          'flex',
    flexDirection:    'column',
    gap:              '6px',
    marginBottom:     '10px',
  },
  label: {
    fontSize:         '10px',
    color:            '#3a3a5c',
    letterSpacing:    '0.1em',
    textTransform:    'uppercase',
  },
  input: {
    background:       '#080810',
    border:           '1px solid #14142a',
    borderRadius:     '6px',
    padding:          '10px 12px',
    color:            '#e8e6f0',
    fontSize:         '12px',
    outline:          'none',
    width:            '100%',
    transition:       'border-color 0.15s, box-shadow 0.15s',
    fontFamily:       'inherit',
  },
  fieldError: {
    fontSize:         '10px',
    color:            '#ef4444',
    letterSpacing:    '0.04em',
  },
  apiError: {
    fontSize:         '11px',
    color:            '#ef4444',
    background:       '#1a0808',
    border:           '1px solid #2a1010',
    borderRadius:     '6px',
    padding:          '9px 12px',
    letterSpacing:    '0.03em',
    marginBottom:     '4px',
  },
  btn: {
    background:       '#5b6cf4',
    border:           'none',
    borderRadius:     '7px',
    padding:          '12px',
    color:            '#fff',
    fontSize:         '12px',
    fontWeight:       '600',
    cursor:           'pointer',
    letterSpacing:    '0.04em',
    width:            '100%',
    marginTop:        '6px',
    fontFamily:       'inherit',
    transition:       'opacity 0.15s',
    boxShadow:        '0 4px 20px #5b6cf433',
  },
  footer: {
    marginTop:        '20px',
    fontSize:         '11px',
    color:            '#3a3a5c',
    textAlign:        'center',
    letterSpacing:    '0.03em',
  },
  link: {
    background:       'none',
    border:           'none',
    color:            '#8b9cf4',
    cursor:           'pointer',
    fontSize:         '11px',
    fontFamily:       'inherit',
    textDecoration:   'underline',
    letterSpacing:    '0.03em',
  },
};