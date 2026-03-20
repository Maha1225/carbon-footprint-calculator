// ============================================================
//  App.tsx — Root with full-screen layout
// ============================================================

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import Dashboard  from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Profile    from './pages/Profile';
import Navbar     from './components/Navbar';

type AuthPage = 'login' | 'signup';
type AppPage  = 'dashboard' | 'calculator' | 'profile';

function InnerApp() {
  const { isLoggedIn } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [appPage,  setAppPage]  = useState<AppPage>('dashboard');

  useEffect(() => {
    if (isLoggedIn) setAppPage('dashboard');
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return authPage === 'signup'
      ? <Signup   onSwitchToLogin={()   => setAuthPage('login')}  />
      : <Login    onSwitchToSignup={() => setAuthPage('signup')} />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      minHeight: '100vh',
      background: '#f1f5f9',
    }}>
      <Navbar currentPage={appPage} onNavigate={setAppPage} />

      <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {appPage === 'dashboard'  && <Dashboard  onGoToCalculator={() => setAppPage('calculator')} />}
        {appPage === 'calculator' && <Calculator onGoToDashboard={() => setAppPage('dashboard')} />}
        {appPage === 'profile'    && <Profile />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
