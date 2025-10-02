import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AuthForm from './components/AuthForm/AuthForm';
import Dashboard from './app/Dashboard/Dashboard';
import LeaderboardPage from './app/LeaderboardPage/LeaderboardPage';
import PetPage from './app/PetPage/PetPage';
import Navbar from './components/Navbar/Navbar';
import NotFound from './app/NotFound/NotFound';
import './styles/global.css';
import Settings from './components/Settings';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setUser(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Navbar />
        <div className="bg-gray-100 min-h-screen pt-16">

          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<AuthForm onLogin={setUser} />} />

            <Route element={<ProtectedRoute user={user} />}>
              <Route path="/dashboard" element={<Dashboard user={user} onLogout={() => setUser(null)} />} />
              <Route path="/pet" element={<PetPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>

        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}