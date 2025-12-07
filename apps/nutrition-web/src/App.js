import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './app/Home';
import Dashboard from './app/Dashboard/Dashboard';
import LeaderboardPage from './app/LeaderboardPage/LeaderboardPage';
import PetPage from './app/PetPage/PetPage';
import MealsPage from './app/MealsPage/MealsPage';
import Settings from './app/Settings/Settings';
import NotFound from './app/NotFound/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AuthForm from './components/AuthForm/AuthForm';
import Navbar from './components/Navbar/Navbar';
import './styles/global.css';
import { AUTH_TOKEN_KEY } from './constants';
import { getUserProfile, clearAuthToken } from './api';


export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    const checkAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (!cancelled) setUser(null);
        return;
      }

      try {
        const res = await getUserProfile();
        // backend returns { user }
        if (!cancelled) setUser(res.data?.user || res.data || null);
      } catch (err) {
        console.error('Auth validation failed:', err);
        if (!cancelled) {
          clearAuthToken();
          setUser(null);
        }
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', checkAuth);
    };
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
              <Route path="/meals" element={<MealsPage />} />
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