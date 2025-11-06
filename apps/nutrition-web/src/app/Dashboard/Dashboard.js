import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PetDisplay from '../../components/PetDisplay';
import LevelUpModal from '../../components/LevelUpModal/LevelUpModal';
import { getUserProfile, completeMeal } from '../../api';
import './Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await getUserProfile();
        setUser(data.user);
      } catch (err) {
        console.error('Fetch error:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  const handleCompleteMeal = async () => {
    if (!user) return;
    try {
      const res = await completeMeal();
      const { points, level } = res.data;
      const leveledUp = level > user.level;

      setUser((currentUser) => ({ ...currentUser, points, level }));

      if (leveledUp) {
        setShowLevelUp(true);
      }
    } catch (err) {
      console.error('Error completing meal:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading Dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Could not load user data. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="dashboard-grid">
          {/* Pet Card */}
          {user.hidePet ? (
            <div className="dashboard-card pet-card hidden-pet-card">
              <p className="pet-title">Your Pet</p>
              <p className="pet-hidden-text">Pet display is hidden. Toggle in Settings to show it.</p>
            </div>
          ) : (
            <div className="dashboard-card pet-card">
              <p className="pet-title">Your Pet</p>
              <PetDisplay level={user.level} petType={user.petType} />
            </div>
          )}

          {/* Stats Card */}
          <div className="dashboard-card stats-card">
            <div className="stat-group">
              <p className="stat-label">Points</p>
              <p className="points-display">{user.points}</p>
            </div>
            <div className="stat-group">
              <p className="stat-label">Level</p>
              <p className="level-display">{user.level}</p>
            </div>
            <button
              onClick={handleCompleteMeal}
              className="complete-meal-button"
            >
              I've Completed a Meal!
            </button>
          </div>
        </div>

        {/* Link to Meals Page */}
        <div className="meals-link-container">
          <Link to="/meals" className="meals-link">
            Go to Today's Meals →
          </Link>
        </div>

        <LevelUpModal isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
      </div>
    </div>
  );
}

