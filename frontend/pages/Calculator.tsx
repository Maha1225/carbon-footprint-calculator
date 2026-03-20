// ============================================================
//  Calculator Page — Full-screen two-column layout
// ============================================================

import { useState } from 'react';
import { calculateCO2 } from '../services/api';

interface Result {
  productName: string;
  co2Emission: number;
  offsetCost: number;
  shippingMethod: string;
  weight: number;
  distance: number;
}

interface Props { onGoToDashboard: () => void; }

const METHODS = [
  {
    value: 'economy',
    icon: '🚢',
    label: 'Economy',
    desc: 'Sea freight — Slowest, lowest CO₂',
    factor: 0.00015,
    days: '15–30 days',
    tagColor: '#16a34a', tagBg: '#f0fdf4',
  },
  {
    value: 'standard',
    icon: '🚛',
    label: 'Standard',
    desc: 'Road freight — Balanced option',
    factor: 0.00021,
    days: '5–10 days',
    tagColor: '#2563eb', tagBg: '#eff6ff',
  },
  {
    value: 'express',
    icon: '✈️',
    label: 'Express',
    desc: 'Air freight — Fastest, most CO₂',
    factor: 0.00035,
    days: '1–3 days',
    tagColor: '#dc2626', tagBg: '#fef2f2',
  },
];

export default function Calculator({ onGoToDashboard }: Props) {
  const [productName, setProduct]  = useState('');
  const [weight,      setWeight]   = useState('');
  const [distance,    setDistance] = useState('');
  const [method,      setMethod]   = useState('standard');
  const [loading,     setLoading]  = useState(false);
  const [error,       setError]    = useState('');
  const [result,      setResult]   = useState<Result | null>(null);

  const factors: Record<string, number> = { economy: 0.00015, standard: 0.00021, express: 0.00035 };
  const liveEstimate = weight && distance
    ? parseFloat(weight) * parseFloat(distance) * factors[method]
    : null;

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setResult(null);
    if (!productName.trim())                 return setError('Please enter a product name.');
    if (!weight || parseFloat(weight) <= 0)  return setError('Please enter a valid weight > 0.');
    if (!distance || parseFloat(distance) <= 0) return setError('Please enter a valid distance > 0.');
    setLoading(true);
    try {
      const data = await calculateCO2({ productName, weight: parseFloat(weight), distance: parseFloat(distance), shippingMethod: method });
      setResult(data.calculation);
    } catch (err: any) {
      setError(err.message || 'Calculation failed. Is the backend running?');
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setProduct(''); setWeight(''); setDistance('');
    setMethod('standard'); setResult(null); setError('');
  };

  const co2Level = (v: number) =>
    v < 0.5
      ? { label: 'Low Emission 😊',     color: '#16a34a', bg: '#f0fdf4', border: '#86efac', bar: '#4ade80' }
      : v < 2
      ? { label: 'Moderate Emission ⚠️', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', bar: '#fbbf24' }
      : { label: 'High Emission 🔴',      color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', bar: '#f87171' };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 46px',
    border: '2px solid #e2e8f0', borderRadius: 12,
    fontSize: 15, color: '#0f172a',
    background: '#fff', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      background: '#f1f5f9',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(120deg, #052e16 0%, #14532d 55%, #166534 100%)',
        padding: '32px 48px 28px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={onGoToDashboard}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px',
              borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#a7f3d0', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 30, letterSpacing: '-0.6px' }}>
              🧮 CO₂ Calculator
            </h1>
            <p style={{ color: '#a7f3d0', fontSize: 14, marginTop: 4 }}>
              Calculate the carbon footprint of your shipment
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', padding: '36px 48px', flex: 1 }} className="calc-pad">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }} className="calc-grid">

          {/* ── LEFT: FORM ── */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            border: '1.5px solid #e2e8f0',
            padding: '32px 36px',
            boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
          }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: '#0f172a', marginBottom: 6 }}>
                Shipment Details
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Fill in the details below to calculate CO₂ emissions</p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 20, padding: '13px 18px',
                background: '#fef2f2', border: '1.5px solid #fecaca',
                borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                  Product Name
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>📦</span>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProduct(e.target.value)}
                    placeholder="e.g. Wireless Headphones"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#16a34a'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* Weight + Distance row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                    Weight (kg)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>⚖️</span>
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="e.g. 2.5"
                      min="0"
                      step="0.1"
                      style={{ ...inputStyle, padding: '13px 14px 13px 44px' }}
                      onFocus={e => e.target.style.borderColor = '#16a34a'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                    Distance (km)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>📍</span>
                    <input
                      type="number"
                      value={distance}
                      onChange={e => setDistance(e.target.value)}
                      placeholder="e.g. 1500"
                      min="0"
                      style={{ ...inputStyle, padding: '13px 14px 13px 44px' }}
                      onFocus={e => e.target.style.borderColor = '#16a34a'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                  Shipping Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {METHODS.map(m => {
                    const active = method === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMethod(m.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 18px',
                          borderRadius: 13,
                          border: active ? `2px solid ${m.tagColor}` : '2px solid #e2e8f0',
                          background: active ? m.tagBg : '#fafafa',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.18s',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{m.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: active ? m.tagColor : '#0f172a' }}>
                            {m.label}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{m.desc}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                            background: m.tagBg, color: m.tagColor,
                            fontWeight: 700, fontSize: 11, border: `1px solid ${m.tagColor}20`,
                          }}>
                            {m.days}
                          </div>
                          {active && (
                            <div style={{ marginTop: 4 }}>
                              <span style={{
                                display: 'inline-block', width: 20, height: 20, borderRadius: '50%',
                                background: m.tagColor, color: '#fff',
                                fontSize: 11, fontWeight: 800, lineHeight: '20px', textAlign: 'center',
                              }}>✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '14px',
                    borderRadius: 12, border: 'none',
                    background: loading
                      ? '#86efac'
                      : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#fff', fontWeight: 800, fontSize: 16,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                  }}
                >
                  {loading ? (
                    <>
                      <svg style={{ width: 20, height: 20, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M4 12a8 8 0 018-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
                      </svg>
                      Calculating...
                    </>
                  ) : '🧮 Calculate CO₂'}
                </button>
                {(result || productName || weight || distance) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      padding: '14px 20px',
                      borderRadius: 12, border: '2px solid #e2e8f0',
                      background: '#fff', color: '#64748b',
                      fontWeight: 700, fontSize: 15,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    ↺ Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── RIGHT: PREVIEW + RESULT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Live Estimate Card */}
            <div style={{
              background: '#fff',
              borderRadius: 20, border: '1.5px solid #e2e8f0',
              padding: '28px 32px',
              boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
            }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 20 }}>
                📡 Live Estimate
              </h3>

              {liveEstimate !== null ? (
                <div className="scale-in">
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>
                      ESTIMATED CO₂ EMISSION
                    </div>
                    <div style={{
                      fontWeight: 900, fontSize: 48, lineHeight: 1,
                      color: co2Level(liveEstimate).color, marginBottom: 6,
                    }}>
                      {liveEstimate.toFixed(4)}
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>kg CO₂</div>
                    <div style={{
                      display: 'inline-block', padding: '6px 18px',
                      borderRadius: 20, fontWeight: 700, fontSize: 13,
                      background: co2Level(liveEstimate).bg,
                      color: co2Level(liveEstimate).color,
                      border: `1.5px solid ${co2Level(liveEstimate).border}`,
                    }}>
                      {co2Level(liveEstimate).label}
                    </div>
                  </div>

                  {/* Bar */}
                  <div style={{ marginTop: 20, background: '#f1f5f9', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (liveEstimate / 5) * 100)}%`,
                      background: co2Level(liveEstimate).bar,
                      borderRadius: 8,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                    <span>0 kg</span><span>5 kg+</span>
                  </div>

                  {/* Breakdown */}
                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Weight',    val: `${weight} kg` },
                      { label: 'Distance',  val: `${parseFloat(distance).toLocaleString()} km` },
                      { label: 'Method',    val: METHODS.find(m => m.value === method)?.label ?? method },
                      { label: 'Offset Cost', val: `$${(liveEstimate * 0.02).toFixed(4)}` },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                        <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: 52, marginBottom: 12, opacity: 0.6 }}>⚖️</div>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>Enter weight and distance<br />to see a live estimate</p>
                </div>
              )}
            </div>

            {/* Result Card */}
            {result && (
              <div style={{
                background: co2Level(result.co2Emission).bg,
                border: `2px solid ${co2Level(result.co2Emission).border}`,
                borderRadius: 20, padding: '28px 32px',
                boxShadow: '0 4px 20px rgba(22,163,74,0.12)',
              }} className="scale-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 28 }}>✅</span>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: 18, color: co2Level(result.co2Emission).color }}>
                      Calculation Saved!
                    </h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                      Results for "{result.productName}"
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <div style={{
                    flex: 1, background: '#fff', borderRadius: 14, padding: '18px 16px', textAlign: 'center',
                    border: '1.5px solid rgba(255,255,255,0.8)',
                  }}>
                    <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>CO₂ EMITTED</div>
                    <div style={{ fontWeight: 900, fontSize: 28, color: co2Level(result.co2Emission).color }}>
                      {result.co2Emission.toFixed(4)}
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>kg CO₂</div>
                  </div>
                  <div style={{
                    flex: 1, background: '#fff', borderRadius: 14, padding: '18px 16px', textAlign: 'center',
                    border: '1.5px solid rgba(255,255,255,0.8)',
                  }}>
                    <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>OFFSET COST</div>
                    <div style={{ fontWeight: 900, fontSize: 28, color: '#7c3aed' }}>
                      ${result.offsetCost.toFixed(4)}
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: 13 }}>USD</div>
                  </div>
                </div>

                <div style={{
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 16,
                }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <p style={{ color: '#374151', fontSize: 13, lineHeight: 1.5 }}>
                    This is equivalent to planting ~<strong>{Math.ceil(result.co2Emission * 40)}</strong> tree{Math.ceil(result.co2Emission * 40) !== 1 ? 's' : ''} to offset these emissions.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={onGoToDashboard}
                    style={{
                      flex: 1, padding: '12px',
                      borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    📊 View Dashboard
                  </button>
                  <button
                    onClick={handleReset}
                    style={{
                      flex: 1, padding: '12px',
                      borderRadius: 12, border: '2px solid #e2e8f0',
                      background: '#fff', color: '#64748b',
                      fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    🔄 New Calculation
                  </button>
                </div>
              </div>
            )}

            {/* Tips card (when no result) */}
            {!result && (
              <div style={{
                background: '#fff',
                borderRadius: 20, border: '1.5px solid #e2e8f0',
                padding: '28px 32px',
                boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
              }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 16 }}>
                  💡 Eco Tips
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { icon: '🚢', tip: 'Sea freight emits 30× less CO₂ than air freight per km.' },
                    { icon: '📦', tip: 'Consolidate multiple orders into one shipment to save emissions.' },
                    { icon: '🌱', tip: 'Carbon offsets help fund renewable energy and reforestation.' },
                    { icon: '📍', tip: 'Source products locally whenever possible to cut distance.' },
                  ].map(t => (
                    <div key={t.tip} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>{t.icon}</div>
                      <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{t.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formula info */}
        <div style={{
          marginTop: 24, padding: '20px 28px',
          background: '#fff', border: '1.5px solid #e2e8f0',
          borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 24 }}>📐</span>
          <div>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Formula: </span>
            <code style={{
              background: '#f1f5f9', padding: '3px 12px', borderRadius: 8,
              fontSize: 13, color: '#16a34a', fontWeight: 700,
            }}>
              CO₂ = Weight (kg) × Distance (km) × Emission Factor
            </code>
            <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 12 }}>
              | Offset Cost = CO₂ × $0.02
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .calc-grid { grid-template-columns: 1fr !important; }
          .calc-pad  { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
