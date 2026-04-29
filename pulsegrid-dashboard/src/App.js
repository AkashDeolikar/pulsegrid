import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem('pg_token') || null
  );

  const handleLogin = (t) => {
    localStorage.setItem('pg_token', t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('pg_token');
    setToken(null);
  };

  return token ? (
    <Dashboard token={token} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}