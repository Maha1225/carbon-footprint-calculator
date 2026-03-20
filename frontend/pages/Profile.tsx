// ============================================================
//  Profile Page — Full-screen layout
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats, getCalculations } from '../services/api';

interface Stats {
  totalCalculations: number;
  totalCO2: number;
  totalOffsets: number;
  totalOffsetCost: number;
}

export default function Profile() {
  const { user, logout } = useAuth();

  const [stats,   setStats]   = useState<Stats | null>(null);
  const [calcs,   setCalcs]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([getStats(), getCalculations()]);
        setStats(s);
        setCalcs(c.calculations);
      } catch { /* offline */ }
      finally { setLoading(false); }
    })();
  }, []);

  const offsetRate = stats && stats.totalCalculations > 0
    ? Math.round((stats.totalOffsets / stats.totalCalculations) * 100)
    : 0;

  const treesNeeded = stats ? Math.round(stats.totalCO2 * 40) : 0;

  // Method breakdown
  const methodCount = calcs.reduce((acc, c) => {
    acc[c.shippingMethod] = (acc[c.shippingMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = calcs.length || 1;

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';
  const memberSince = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      background: '#f1f5f9',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(120deg, #052e16 0%, #14532d 55%, #166534 100%)',
        padding: '40px 48px 80px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: 88, height: 88,
            background: 'linear-gradient(135deg, #4ade80, #16a34a)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 900, color: '#fff',
            margin: '0 auto 16px',
            boxShadow: '0 0 0 6px rgba(255,255,255,0.15)',
          }}>{initial}</div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 30, letterSpacing: '-0.6px', marginBottom: 6 }}>
            {user?.name}
          </h1>
          <p style={{ color: '#86efac', fontSize: 15 }}>{user?.email}</p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 12, padding: '5px 16px',
            background: 'rgba(255,255,255,0.12)', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span style={{ fontSize: 14 }}>🗓️</span>
            <span style={{ color: '#d1fae5', fontSize: 13, fontWeight: 600 }}>
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT (overlapping cards) ── */}
      <div style={{ maxWidth: 1100, margin: '-48px auto 0', padding: '0 48px 48px' }} className="profile-pad">

        {/* Top Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="profile-stats">
          {[
            { icon: '📦', label: 'Shipments',    value: stats?.totalCalculations ?? 0, suffix: '',   color: '#3b82f6' },
            { icon: '💨', label: 'CO₂ Tracked',  value: stats ? +stats.totalCO2.toFixed(2) : 0, suffix: ' kg', color: '#f97316' },
            { icon: '🌱', label: 'Offsets',       value: stats?.totalOffsets ?? 0, suffix: '',   color: '#22c55e' },
            { icon: '💰', label: 'Spent',          value: stats ? +stats.totalOffsetCost.toFixed(2) : 0, suffix: '$', color: '#a855f7', prefix: true },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 18, padding: '22px 22px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(15,23,42,0.07)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 28, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                {s.prefix ? `$${s.value}` : `${s.value}${s.suffix}`}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="profile-grid">

          {/* Eco Score */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 24 }}>
              🌍 Eco Score
            </h3>

            {/* Circular progress */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                  <circle
                    cx="80" cy="80" r="68" fill="none"
                    stroke={offsetRate >= 70 ? '#16a34a' : offsetRate >= 40 ? '#f97316' : '#dc2626'}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${(2 * Math.PI * 68 * offsetRate) / 100} ${2 * Math.PI * 68}`}
                    strokeDashoffset={2 * Math.PI * 68 * 0.25}
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontWeight: 900, fontSize: 34, lineHeight: 1,
                    color: offsetRate >= 70 ? '#16a34a' : offsetRate >= 40 ? '#f97316' : '#dc2626',
                  }}>
                    {offsetRate}%
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                    Offset Rate
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Shipments Offset', val: `${stats?.totalOffsets ?? 0} / ${stats?.totalCalculations ?? 0}` },
                { label: 'Trees Equivalent', val: `~${treesNeeded} trees` },
                { label: 'Total CO₂', val: `${stats?.totalCO2.toFixed(3) ?? '0.000'} kg` },
                { label: 'Eco Rating', val: offsetRate >= 70 ? '⭐ Green Champion' : offsetRate >= 40 ? '⚡ Getting There' : '🌱 Just Starting' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #f1f5f9',
                }}>
                  <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>{r.label}</span>
                  <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 800 }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Breakdown */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 24 }}>
              📊 Shipping Breakdown
            </h3>

            {[
              { method: 'economy',  icon: '🚢', label: 'Economy',  color: '#16a34a', bg: '#f0fdf4' },
              { method: 'standard', icon: '🚛', label: 'Standard', color: '#2563eb', bg: '#eff6ff' },
              { method: 'express',  icon: '✈️', label: 'Express',  color: '#dc2626', bg: '#fef2f2' },
            ].map(m => {
              const count = methodCount[m.method] || 0;
              const pct   = Math.round((count / total) * 100);
              return (
                <div key={m.method} style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{m.icon}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{m.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{count} shipments</span>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                        background: m.bg, color: m.color,
                        fontWeight: 800, fontSize: 13, border: `1px solid ${m.color}30`,
                      }}>{calcs.length === 0 ? '0%' : `${pct}%`}</span>
                    </div>
                  </div>
                  <div style={{ height: 10, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${calcs.length === 0 ? 0 : pct}%`,
                      background: m.color, borderRadius: 8,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}

            {/* Most used */}
            {calcs.length > 0 && (
              <div style={{
                marginTop: 24, padding: '14px 18px',
                background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                borderRadius: 14,
              }}>
                <p style={{ color: '#15803d', fontWeight: 600, fontSize: 13 }}>
                  🏆 Most used:{' '}
                  <strong>
                    {(Object.entries(methodCount) as [string, number][]).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'}
                  </strong>{' '}
                  shipping
                </p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                <svg style={{ width: 32, height: 32, animation: 'spin 0.9s linear infinite' }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#d1fae5" strokeWidth="3" />
                  <path d="M4 12a8 8 0 018-8" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Account Details + Danger Zone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }} className="profile-grid">

          {/* Account Info */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 20 }}>
              👤 Account Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Full Name',   val: user?.name ?? '—',  icon: '👤' },
                { label: 'Email',       val: user?.email ?? '—', icon: '📧' },
                { label: 'Account Type', val: 'Free Plan',        icon: '🎯' },
                { label: 'Status',       val: '✅ Active',        icon: '🟢' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>{row.icon}</div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</div>
                    <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, marginTop: 2 }}>{row.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions + Danger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick Actions */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '28px 32px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
            }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 16 }}>
                ⚡ Quick Facts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '🌿', text: `Your shipments equal ${treesNeeded} trees worth of CO₂` },
                  { icon: '💚', text: `${offsetRate}% of your shipments are carbon neutral` },
                  { icon: '♻️', text: `You spent $${stats?.totalOffsetCost.toFixed(2) ?? '0.00'} on green credits` },
                ].map(f => (
                  <div key={f.text} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '12px 14px',
                    background: '#f8fafc', borderRadius: 12,
                    border: '1px solid #e2e8f0',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ color: '#475569', fontSize: 13, lineHeight: 1.5, fontWeight: 500 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '24px 32px',
              border: '1.5px solid #fecaca',
              boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
            }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#dc2626', marginBottom: 8 }}>
                ⚠️ Danger Zone
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                You will need to log in again after signing out.
              </p>
              <button
                onClick={logout}
                style={{
                  width: '100%', padding: '12px',
                  borderRadius: 12, border: '2px solid #fca5a5',
                  background: '#fef2f2', color: '#dc2626',
                  fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
              >
                🚪 Sign Out of EcoShip
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .profile-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .profile-grid  { grid-template-columns: 1fr !important; }
          .profile-pad   { padding: 0 16px 32px !important; }
        }
      `}</style>
    </div>
  );
}
