// ============================================================
//  Dashboard — Full-screen layout with stats + history
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStats, getCalculations, purchaseOffset, deleteCalculation } from '../services/api';

interface Calculation {
  _id: string;
  productName: string;
  weight: number;
  distance: number;
  shippingMethod: string;
  co2Emission: number;
  offsetCost: number;
  offsetPurchased: boolean;
  createdAt: string;
}
interface Stats {
  totalCalculations: number;
  totalCO2: number;
  totalOffsets: number;
  totalOffsetCost: number;
}
interface Props { onGoToCalculator: () => void; }

const METHOD_ICON: Record<string, string> = { economy: '🚢', standard: '🚛', express: '✈️' };

export default function Dashboard({ onGoToCalculator }: Props) {
  const { user } = useAuth();

  const [stats,   setStats]   = useState<Stats | null>(null);
  const [calcs,   setCalcs]   = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');
  const [toastOk, setToastOk] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true); setError('');
    try {
      const [s, c] = await Promise.all([getStats(), getCalculations()]);
      setStats(s);
      setCalcs(c.calculations);
    } catch {
      setError('Cannot connect to backend. Run: cd backend && npm start');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, ok = true) {
    setToast(msg); setToastOk(ok);
    setTimeout(() => setToast(''), 3500);
  }

  async function handleOffset(id: string) {
    try {
      await purchaseOffset(id);
      showToast('✅ Carbon offset purchased!', true);
      loadData();
    } catch (err: any) { showToast('❌ ' + err.message, false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this calculation?')) return;
    setDeleting(id);
    try {
      await deleteCalculation(id);
      showToast('🗑️ Deleted successfully', true);
      loadData();
    } catch (err: any) { showToast('❌ ' + err.message, false); }
    finally { setDeleting(null); }
  }

  const filtered = filter === 'all' ? calcs : calcs.filter(c => c.shippingMethod === filter);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const co2Color = (v: number) => v < 0.5 ? '#16a34a' : v < 2 ? '#d97706' : '#dc2626';
  const co2Bg    = (v: number) => v < 0.5 ? '#f0fdf4' : v < 2 ? '#fffbeb' : '#fef2f2';

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      background: '#f1f5f9',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '14px 22px', borderRadius: 12,
          background: toastOk ? '#052e16' : '#7f1d1d',
          color: '#fff', fontWeight: 600, fontSize: 14,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          minWidth: 260,
        }} className="slide-down">
          {toast}
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(120deg, #052e16 0%, #14532d 55%, #166534 100%)',
        padding: '40px 48px 36px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#86efac', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                {greeting} 👋
              </p>
              <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 34, letterSpacing: '-0.8px', marginBottom: 8, lineHeight: 1.2 }}>
                {user?.name}'s Dashboard
              </h1>
              <p style={{ color: '#a7f3d0', fontSize: 15 }}>
                Track your shipping emissions and offset your carbon footprint
              </p>
            </div>
            <button
              onClick={onGoToCalculator}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '13px 26px',
                borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #4ade80, #16a34a)',
                color: '#052e16', fontWeight: 800, fontSize: 15,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 16px rgba(74,222,128,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 18 }}>＋</span> New Calculation
            </button>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16, marginTop: 36,
          }}
            className="stats-grid"
          >
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} style={{ height: 100, borderRadius: 16, background: 'rgba(255,255,255,0.08)' }} className="shimmer" />
              ))
            ) : stats ? (
              <>
                <StatCard icon="📦" label="Total Shipments" value={stats.totalCalculations.toString()} sub="calculations saved" color="#60a5fa" />
                <StatCard icon="💨" label="Total CO₂" value={`${stats.totalCO2.toFixed(2)} kg`} sub="emissions tracked" color="#fb923c" />
                <StatCard icon="🌱" label="Offsets Bought" value={stats.totalOffsets.toString()} sub="credits purchased" color="#4ade80" />
                <StatCard icon="💰" label="Amount Spent" value={`$${stats.totalOffsetCost.toFixed(2)}`} sub="on offset credits" color="#c084fc" />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 48px' }} className="main-pad">

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 24, padding: '18px 22px',
            background: '#fef2f2', border: '1.5px solid #fca5a5',
            borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <p style={{ color: '#991b1b', fontWeight: 700, fontSize: 15 }}>Backend not connected</p>
              <p style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{error}</p>
              <code style={{
                display: 'inline-block', marginTop: 8,
                background: '#fde8e8', color: '#b91c1c',
                padding: '4px 12px', borderRadius: 8, fontSize: 12,
              }}>cd backend && npm install && npm start</code>
            </div>
          </div>
        )}

        {/* Impact Banner */}
        {stats && stats.totalCO2 > 0 && (
          <div style={{
            marginBottom: 28,
            padding: '24px 32px',
            background: 'linear-gradient(120deg, #052e16 0%, #14532d 60%, #15803d 100%)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 20, flexWrap: 'wrap', overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', right: -20, top: -20, fontSize: 120,
              opacity: 0.07, lineHeight: 1, userSelect: 'none',
            }}>🌍</div>
            <div style={{ zIndex: 1 }}>
              <p style={{ color: '#86efac', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Environmental Impact
              </p>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
                {stats.totalOffsets > 0
                  ? `🎉 ${stats.totalOffsets} shipment${stats.totalOffsets > 1 ? 's' : ''} offset!`
                  : `${stats.totalCO2.toFixed(3)} kg CO₂ tracked so far`}
              </h3>
              <p style={{ color: '#a7f3d0', fontSize: 13 }}>
                {stats.totalOffsets === stats.totalCalculations && stats.totalCalculations > 0
                  ? '🌟 All your shipments are carbon neutral!'
                  : `${stats.totalCalculations - stats.totalOffsets} shipment(s) still need offsetting`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16, zIndex: 1 }}>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 24 }}>
                  {Math.round(stats.totalCO2 * 40)}
                </div>
                <div style={{ color: '#a7f3d0', fontSize: 12, marginTop: 2 }}>Trees Needed</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 24 }}>
                  {stats.totalCalculations > 0 ? Math.round((stats.totalOffsets / stats.totalCalculations) * 100) : 0}%
                </div>
                <div style={{ color: '#a7f3d0', fontSize: 12, marginTop: 2 }}>Offset Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Calculations Table Card */}
        <div style={{
          background: '#fff',
          borderRadius: 18,
          border: '1.5px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
        }}>
          {/* Card Header */}
          <div style={{
            padding: '22px 28px',
            borderBottom: '1.5px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap', background: '#fafafa',
          }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: '#0f172a', letterSpacing: '-0.4px' }}>
                📋 My Calculations
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>
                {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Filters */}
              {[
                { val: 'all',      label: '🗂 All'      },
                { val: 'economy',  label: '🚢 Economy'  },
                { val: 'standard', label: '🚛 Standard' },
                { val: 'express',  label: '✈️ Express'  },
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setFilter(f.val)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.18s',
                    background: filter === f.val
                      ? 'linear-gradient(135deg, #16a34a, #15803d)'
                      : '#f1f5f9',
                    color: filter === f.val ? '#fff' : '#64748b',
                    boxShadow: filter === f.val ? '0 2px 8px rgba(22,163,74,0.3)' : 'none',
                  }}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={loadData}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: '1.5px solid #d1fae5',
                  background: '#f0fdf4', color: '#16a34a',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <svg style={{ width: 44, height: 44, animation: 'spin 0.9s linear infinite', color: '#16a34a' }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#d1fae5" strokeWidth="3" />
                <path d="M4 12a8 8 0 018-8" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
              <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: 16 }}>Loading calculations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '72px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
              <h3 style={{ color: '#0f172a', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
                {filter === 'all' ? 'No calculations yet!' : `No ${filter} shipments`}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 320, margin: '0 auto 24px' }}>
                {filter === 'all'
                  ? 'Click "New Calculation" to calculate your first shipment\'s carbon footprint.'
                  : `You haven't calculated any ${filter} shipments yet.`}
              </p>
              <button
                onClick={onGoToCalculator}
                style={{
                  padding: '12px 28px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                }}
              >
                ＋ New Calculation
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Product', 'Method', 'Weight', 'Distance', 'CO₂ Emission', 'Offset Cost', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '13px 18px', textAlign: 'left',
                          fontWeight: 700, fontSize: 12, color: '#64748b',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderBottom: '1.5px solid #f1f5f9',
                          whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((calc, i) => (
                      <tr
                        key={calc._id}
                        style={{
                          borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Product */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{calc.productName}</div>
                        </td>

                        {/* Method */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 20,
                            background: calc.shippingMethod === 'economy' ? '#f0fdf4'
                              : calc.shippingMethod === 'express' ? '#fef2f2' : '#eff6ff',
                            color: calc.shippingMethod === 'economy' ? '#16a34a'
                              : calc.shippingMethod === 'express' ? '#dc2626' : '#2563eb',
                            fontWeight: 700, fontSize: 12, textTransform: 'capitalize',
                          }}>
                            {METHOD_ICON[calc.shippingMethod]} {calc.shippingMethod}
                          </div>
                        </td>

                        {/* Weight */}
                        <td style={{ padding: '16px 18px', color: '#475569', fontWeight: 500 }}>
                          {calc.weight} kg
                        </td>

                        {/* Distance */}
                        <td style={{ padding: '16px 18px', color: '#475569', fontWeight: 500 }}>
                          {calc.distance.toLocaleString()} km
                        </td>

                        {/* CO2 */}
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '5px 10px', borderRadius: 8,
                            background: co2Bg(calc.co2Emission),
                            color: co2Color(calc.co2Emission),
                            fontWeight: 800, fontSize: 13,
                          }}>
                            💨 {calc.co2Emission.toFixed(4)} kg
                          </div>
                        </td>

                        {/* Cost */}
                        <td style={{ padding: '16px 18px', color: '#7c3aed', fontWeight: 700 }}>
                          ${calc.offsetCost.toFixed(4)}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '16px 18px' }}>
                          {calc.offsetPurchased ? (
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '5px 12px', borderRadius: 20,
                              background: '#f0fdf4', color: '#16a34a',
                              fontWeight: 700, fontSize: 12, border: '1.5px solid #86efac',
                            }}>
                              ✅ Offset
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOffset(calc._id)}
                              style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                color: '#fff', fontWeight: 700, fontSize: 12,
                                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                              }}
                            >
                              🌱 Buy Offset
                            </button>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '16px 18px', color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(calc.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 18px' }}>
                          <button
                            onClick={() => handleDelete(calc._id)}
                            disabled={deleting === calc._id}
                            style={{
                              padding: '7px 12px', borderRadius: 8,
                              border: '1.5px solid #fecaca',
                              background: deleting === calc._id ? '#fde8e8' : '#fff',
                              color: '#dc2626', fontWeight: 600, fontSize: 13,
                              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div style={{
                padding: '16px 28px',
                borderTop: '1.5px solid #f1f5f9',
                background: '#fafafa',
                display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> of <strong style={{ color: '#0f172a' }}>{calcs.length}</strong> records
                </div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  Total CO₂: <strong style={{ color: '#d97706' }}>
                    {filtered.reduce((s, c) => s + c.co2Emission, 0).toFixed(4)} kg
                  </strong>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  Total Cost: <strong style={{ color: '#7c3aed' }}>
                    ${filtered.reduce((s, c) => s + c.offsetCost, 0).toFixed(4)}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 24 }} className="info-grid">
          {[
            { icon: '🚢', title: 'Economy Shipping', desc: 'Sea freight with lowest CO₂ emissions. Emission factor: 0.00015 kg CO₂ per kg·km.', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
            { icon: '🚛', title: 'Standard Shipping', desc: 'Road freight for balanced speed and emissions. Emission factor: 0.00021 kg CO₂ per kg·km.', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
            { icon: '✈️', title: 'Express Shipping', desc: 'Air freight is fastest but highest CO₂. Emission factor: 0.00035 kg CO₂ per kg·km.', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          ].map(c => (
            <div key={c.title} style={{
              background: c.bg, border: `1.5px solid ${c.border}`,
              borderRadius: 16, padding: '22px 24px',
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{c.icon}</div>
              <h4 style={{ fontWeight: 700, color: c.color, fontSize: 15, marginBottom: 6 }}>{c.title}</h4>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .info-grid  { grid-template-columns: 1fr !important; }
          .main-pad   { padding: 20px 16px !important; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.10)',
      border: '1.5px solid rgba(255,255,255,0.12)',
      borderRadius: 16, padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'rgba(255,255,255,0.13)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ color: color, fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>{value}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}
