// ============================================================
//  Navbar — Full-width top bar with logo, nav links, user info
// ============================================================

import { useAuth } from '../context/AuthContext';

type Page = 'dashboard' | 'calculator' | 'profile';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'dashboard',  icon: '📊', label: 'Dashboard'  },
  { page: 'calculator', icon: '🧮', label: 'Calculator'  },
  { page: 'profile',    icon: '👤', label: 'Profile'     },
];

export default function Navbar({ currentPage, onNavigate }: Props) {
  const { user, logout } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <nav
      style={{
        width: '100%',
        background: 'linear-gradient(90deg, #052e16 0%, #14532d 50%, #166534 100%)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 16px 0 rgba(5,46,22,0.18)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => onNavigate('dashboard')}
        >
          <div style={{
            width: 40, height: 40,
            background: 'rgba(255,255,255,0.13)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            border: '1.5px solid rgba(255,255,255,0.18)',
          }}>🌿</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              EcoShip
            </div>
            <div style={{ color: '#86efac', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em' }}>
              Carbon Tracker
            </div>
          </div>
        </div>

        {/* Center Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_ITEMS.map(({ page, icon, label }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 18px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.18s ease',
                  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: active ? '#ffffff' : '#a7f3d0',
                  boxShadow: active ? 'inset 0 1px 2px rgba(0,0,0,0.10)' : 'none',
                  letterSpacing: '-0.01em',
                }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #4ade80, #16a34a)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 15,
              border: '2px solid rgba(255,255,255,0.22)',
            }}>
              {initial}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ color: '#f0fdf4', fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
              <div style={{ color: '#86efac', fontSize: 11 }}>{user?.email}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.15)' }} />

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              borderRadius: 9,
              border: '1.5px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fecaca',
              fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <span style={{ fontSize: 15 }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div style={{
        display: 'none',
        width: '100%',
        background: '#052e16',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '6px 0',
        justifyContent: 'space-around',
      }}
        className="mobile-nav"
      >
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 20px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: active ? '#ffffff' : '#86efac',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-nav { display: flex !important; }
          nav > div:first-child > div:nth-child(2) { display: none !important; }
          nav > div:first-child > div:nth-child(3) { display: none !important; }
          nav > div:first-child { justify-content: center !important; }
        }
      `}</style>
    </nav>
  );
}
