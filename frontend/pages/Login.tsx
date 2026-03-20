// ============================================================
//  Login Page — Full-screen split layout
// ============================================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

interface Props {
  onSwitchToSignup: () => void;
}

export default function Login({ onSwitchToSignup }: Props) {
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Please enter your email address.');
    if (!password)     return setError('Please enter your password.');
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#f8fafc',
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '48%',
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #052e16 0%, #14532d 45%, #16a34a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="login-left"
      >
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.15), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(134,239,172,0.12), transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
          <div style={{
            width: 48, height: 48,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, border: '1.5px solid rgba(255,255,255,0.2)',
          }}>🌿</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 24, letterSpacing: '-0.5px' }}>EcoShip</div>
            <div style={{ color: '#86efac', fontSize: 12, fontWeight: 500 }}>Carbon Footprint Tracker</div>
          </div>
        </div>

        {/* Center content */}
        <div style={{ zIndex: 2 }}>
          <div style={{ fontSize: 72, marginBottom: 24, lineHeight: 1 }}>🌍</div>
          <h2 style={{
            color: '#fff', fontWeight: 800, fontSize: 40,
            lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 16,
          }}>
            Ship Smarter.<br />Emit Less.
          </h2>
          <p style={{ color: '#a7f3d0', fontSize: 17, lineHeight: 1.7, marginBottom: 36, maxWidth: 380 }}>
            Calculate CO₂ emissions from your e-commerce shipments, purchase carbon offsets, and help build a greener planet.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🧮', text: 'Real-time CO₂ calculation' },
              { icon: '🌱', text: 'Purchase carbon offset credits' },
              { icon: '📊', text: 'Track your shipping history' },
              { icon: '♻️', text: '3 shipping methods supported' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36,
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, border: '1px solid rgba(255,255,255,0.1)',
                }}>{f.icon}</div>
                <span style={{ color: '#d1fae5', fontSize: 15, fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: '20px 24px',
          zIndex: 2,
        }}>
          <p style={{ color: '#d1fae5', fontSize: 14, fontStyle: 'italic', lineHeight: 1.6 }}>
            "Every shipment tracked is a step toward a sustainable future."
          </p>
          <p style={{ color: '#86efac', fontSize: 12, fontWeight: 600, marginTop: 8 }}>— EcoShip Team</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: '#f8fafc',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }} className="fade-in">

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{
              fontSize: 32, fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 10,
            }}>
              Welcome back 👋
            </h1>
            <p style={{ color: '#64748b', fontSize: 16 }}>
              Sign in to your EcoShip account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 20,
              padding: '14px 18px',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: 12,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }} className="slide-down">
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18,
                }}>📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '13px 14px 13px 44px',
                    border: '2px solid #e2e8f0', borderRadius: 12,
                    fontSize: 15, color: '#0f172a',
                    background: '#fff', fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18,
                }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '13px 48px 13px 44px',
                    border: '2px solid #e2e8f0', borderRadius: 12,
                    fontSize: 15, color: '#0f172a',
                    background: '#fff', fontFamily: 'Inter, sans-serif',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
                  }}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: loading
                  ? '#86efac'
                  : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                transition: 'all 0.2s',
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <svg style={{ width: 20, height: 20, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M4 12a8 8 0 018-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                  Signing in...
                </>
              ) : (
                '🔐  Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Don't have an account?</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Switch to signup */}
          <button
            onClick={onSwitchToSignup}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 12,
              border: '2px solid #16a34a',
              background: 'transparent',
              color: '#16a34a',
              fontWeight: 700, fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f0fdf4';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🌱 Create a Free Account
          </button>

          {/* Stats row */}
          <div style={{
            marginTop: 36,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}>
            {[
              { num: '10K+', label: 'Shipments' },
              { num: '5T+',  label: 'CO₂ Tracked' },
              { num: '2K+',  label: 'Offsets Sold' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#fff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px 8px',
                textAlign: 'center',
              }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#16a34a' }}>{s.num}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
