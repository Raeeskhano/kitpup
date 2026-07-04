import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import PetShop from './pages/PetShop';
import RescueReport from './pages/RescueReport';
import LostFound from './pages/LostFound';
import AIChat from './pages/AIChat';
import VetLocator from './pages/VetLocator';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Placeholder from './pages/Placeholder';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('kitpup_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('kitpup_user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kitpup_user');
    setAuthPage('login');
  };

  const renderAuthPage = () => {
    switch (authPage) {
      case 'login': return <Login onLogin={handleLogin} navigateTo={setAuthPage} />;
      case 'register': return <Register onLogin={handleLogin} navigateTo={setAuthPage} />;
      case 'forgotPassword': return <ForgotPassword navigateTo={setAuthPage} />;
      default: return <Login onLogin={handleLogin} navigateTo={setAuthPage} />;
    }
  };

  const renderPage = () => {
    const path = window.location.pathname;
    if (path === '/checkout/success') return <CheckoutSuccess setCurrentPage={setCurrentPage} />;
    if (path === '/checkout/cancel') return <CheckoutCancel setCurrentPage={setCurrentPage} />;

    switch (currentPage) {
      case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'marketplace': return <Marketplace />;
      case 'petshop': return <PetShop />;
      case 'rescuereport': return <RescueReport />;
      case 'lostfound': return <LostFound />;
      case 'aichat': return <AIChat />;
      case 'vetlocator': return <VetLocator />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings onLogout={handleLogout} />;
      default: return <Dashboard />;
    }
  };

  if (isLoading) return null;

  if (!user) {
    return renderAuthPage();
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}

export default App;
