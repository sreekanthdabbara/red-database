import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/prevalence');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-hero">
      <div className="hero-logo">
         <img src="/logo.png" alt="REED Logo" />
      </div>

        <h1 className="hero-headline">
          <span className="hero-accent">MAN, AND MACHINE</span>{' '}
          built rare disease epi database
         </h1>

        <div className="hero-globe">
          <img src="/globe.png" alt="RED Globe" />
        </div>

        <p className="hero-tagline">
          Rare disease epi database built from Man &amp; Machine Collaboration
          approach to access most accurate, and latest data on burden of rare diseases
        </p>
      </div>

      {/* Right Panel */}
      <div className="login-panel">
        <div className="login-card">
          <h2 className="login-title">Log in</h2>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-row">
              <Link to="/forgot-password" className="forgot-link">Forgot password &rsaquo;</Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="signup-row">
            Don't have an account?{' '}
            <Link to="/register" className="signup-link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
