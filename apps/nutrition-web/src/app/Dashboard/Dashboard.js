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
    <>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pet Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <p className="pet-title">Your Pet</p>
            <PetDisplay level={user.level} petType={user.petType} />
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-gray-500">Points</p>
              <p className="text-4xl font-semibold text-green-600">{user.points}</p>
            </div>
            <div className="mt-4">
              <p className="text-gray-500">Level</p>
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
        <div className="mt-8 text-center">
          <Link to="/meals" className="text-lg text-indigo-600 hover:text-indigo-800 font-semibold">
            Go to Today's Meals →
          </Link>
        </div>

        <LevelUpModal isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
      </div>
    </>
  );
}

