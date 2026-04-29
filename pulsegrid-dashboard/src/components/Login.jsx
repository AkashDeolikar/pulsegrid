import { useState } from 'react';
import axios from 'axios';
import config from '../config';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${config.API_BASE}/auth/login`, {
        email,
        password,
      });
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>⚡ PulseGrid</div>
        <div style={styles.subtitle}>Distributed Messaging Platform</div>

        <div style={styles.label}>Email</div>
        <input
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="akash@test.com"
        />

        <div style={styles.label}>Password</div>
        <input
          type="password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#13131a',
    border: '1px solid #1e1e2e',
    borderRadius: 12,
    padding: '2rem',
    width: 360,
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 28,
    fontFamily: 'monospace',
  },
  label: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  input: {
    width: '100%',
    background: '#0a0a0f',
    border: '1px solid #1e1e2e',
    borderRadius: 6,
    padding: '10px 12px',
    color: '#e2e8f0',
    fontSize: 13,
    marginBottom: 14,
    outline: 'none',
  },
  error: {
    fontSize: 12,
    color: '#fc8181',
    marginBottom: 12,
    padding: '8px 10px',
    background: '#1a0a0a',
    borderRadius: 6,
  },
  btn: {
    width: '100%',
    background: '#185FA5',
    border: 'none',
    borderRadius: 6,
    padding: '11px',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 4,
  },
};