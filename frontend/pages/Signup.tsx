// ============================================================
//  Signup Page — Full-screen split layout
// ============================================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signupUser } from '../services/api';

interface Props {
  onSwitchToLogin: () => void;
}

export default function Signup({ onSwitchToLogin }: Props) {
  const { login } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);

  // Password strength
  const pwStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength     = pwStrength(password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || '';
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength] || '#e2e8f0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim())            return setError('Please enter your full name.');
    if (!email.trim())           return setError('Please enter your email address.');
    if (password.length < 6)     return setError('Password must be at least 6 characters.');
    if (password !== confirm)    return setError('Passwords do not match.');
    setLoading(true);
    try {
      const data = await signupUser(name, email, password);
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 44px',
    border: '2px solid #e2e8f0', borderRadius: 12,
    fontSize: 15, color: '#0f172a',
    background: '#fff', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8,
  };
  const iconStyle: React.CSSProperties = {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18,
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#f8fafc',
    }}>

      {/* ── RIGHT FORM ── */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: '#f8fafc',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 460 }} className="fade-in">

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🌱</div>
            <h1 style={{
              fontSize: 30, fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.7px', marginBottom: 8,
            }}>Create your account</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>
              Join EcoShip and start tracking your carbon footprint
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 20, padding: '14px 18px',
              background: '#fef2f2', border: '1.5px solid #fecaca',
              borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 10,
            }} className="slide-down">
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={iconStyle}>👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={iconStyle}>📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={iconStyle}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={e => e.target.style.borderColor = '#16a34a'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
                }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Strength meter */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4,
                        background: i <= strength ? strengthColor : '#e2e8f0',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={iconStyle}>✅</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  style={{
                    ...inputStyle,
                    borderColor: confirm
                      ? confirm === password ? '#16a34a' : '#ef4444'
                      : '#e2e8f0',
                  }}
                  onFocus={e => {
                    if (!confirm) e.target.style.borderColor = '#16a34a';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = confirm
                      ? confirm === password ? '#16a34a' : '#ef4444'
                      : '#e2e8f0';
                  }}
                />
                {confirm && (
                  <span style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 18,
                  }}>
                    {confirm === password ? '✅' : '❌'}
                  </span>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 12, border: 'none',
                background: loading ? '#86efac' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#fff', fontWeight: 700, fontSize: 16,
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
                  Creating account...
                </>
              ) : '🌱  Create My Account'}
            </button>
          </form>

          {/* Switch to login */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ color: '#64748b', fontSize: 14 }}>Already have an account? </span>
            <button
              onClick={onSwitchToLogin}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#16a34a', fontWeight: 700, fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'underline',
              }}
            >
              Sign In →
            </button>
          </div>

          {/* Trust badges */}
          <div style={{
            marginTop: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
          }}>
            {[
              { icon: '🔒', label: 'Secure' },
              { icon: '🌱', label: 'Eco-first' },
              { icon: '🆓', label: 'Free to use' },
            ].map(b => (
              <div key={b.label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: '#94a3b8', fontSize: 12, fontWeight: 500,
              }}>
                <span style={{ fontSize: 16 }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LEFT DECORATIVE PANEL ── */}
      <div style={{
        width: '44%',
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #052e16 0%, #14532d 50%, #166534 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="signup-right"
      >
        {/* Blobs */}
        <div style={{
          position: 'absolute', top: -100, left: -100,
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.14), transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(134,239,172,0.1), transparent 70%)',
        }} />

        {/* Content */}
        <div style={{ textAlign: 'center', zIndex: 2, marginBottom: 48 }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>♻️</div>
          <h2 style={{
            color: '#fff', fontWeight: 800, fontSize: 34,
            letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 16,
          }}>
            Go Green with<br />Every Shipment
          </h2>
          <p style={{ color: '#a7f3d0', fontSize: 16, lineHeight: 1.7, maxWidth: 340 }}>
            Join thousands of eco-conscious businesses reducing their carbon footprint one delivery at a time.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          width: '100%', maxWidth: 380, zIndex: 2,
        }}>
          {[
            { icon: '📦', num: '10K+', label: 'Shipments Tracked' },
            { icon: '🌱', num: '2K+',  label: 'Offsets Purchased' },
            { icon: '💨', num: '5T+',  label: 'CO₂ Monitored'    },
            { icon: '🌍', num: '50+',  label: 'Countries Served'  },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.09)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, padding: '20px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 22 }}>{s.num}</div>
              <div style={{ color: '#a7f3d0', fontSize: 12, fontWeight: 500, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .signup-right { display: none !important; }
        }
      `}</style>
    </div>
  );
}
