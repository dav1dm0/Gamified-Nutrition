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