import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/world-population');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
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
          <h2 className="login-title">Sign up</h2>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="signup-row">
            Already have an account?{' '}
            <Link to="/login" className="signup-link">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
