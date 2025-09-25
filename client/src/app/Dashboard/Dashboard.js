import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PetDisplay from '../../components/PetDisplay';
import LevelUpModal from '../../components/LevelUpModal/LevelUpModal';
import MealCard from '../../components/MealCard/MealCard';
import mealsData from '../../data/meals.json';
import { getUserProfile, completeMeal } from '../../api';
import './Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [meals, setMeals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [uRes] = await Promise.all(
          [getUserProfile()]
        );
        setUser(uRes.data);
      } catch (err) {
        console.error('Fetch error:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  useEffect(() => {
    // Initialize 3 random meals (one for each time)
    const times = ['Breakfast', 'Lunch', 'Dinner'];
    const randomMeals = times.map((time) => {
      const options = mealsData.filter((m) => m.timeOfDay === time);
      return options[Math.floor(Math.random() * options.length)];
    });
    setMeals(randomMeals);
  }, []);

  const handleCompleteMeal = async () => {
    try {
      const res = await completeMeal();
      const { points, level } = res.data;
      const leveledUp = level > user.level;
      setUser((u) => ({ ...u, points, level }));
      if (leveledUp) setShowLevelUp(true);
    } catch (err) {
      console.error('Error completing meal:', err);
    }
  };

  const replaceMeal = (index) => {
    const time = meals[index].timeOfDay;
    const options = mealsData.filter((m) => m.timeOfDay === time && m.id !== meals[index].id);
    const replacement = options[Math.floor(Math.random() * options.length)];
    setMeals((prev) => {
      const updated = [...prev];
      updated[index] = replacement;
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600">Loading Dashboard…</p>
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
            <PetDisplay level={user.level} petType={user.petType} />
            <p className="mt-4 text-gray-700">Your Pet</p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-gray-500">Points</p>
              <p className="text-4xl font-semibold text-green-600">{user.points}</p>
            </div>
            <div className="mt-4">
              <p className="text-gray-500">Level</p>
              <p className="text-4xl font-semibold text-blue-600">{user.level}</p>
            </div>
            <button
              onClick={handleCompleteMeal}
              className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Complete Meal
            </button>
          </div>
        </div>
        <LevelUpModal isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />

        {/* Meals Card */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Meals</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {meals.map((meal, idx) => (
              <MealCard key={meal.id} meal={meal} onReplace={() => replaceMeal(idx)} />
            ))}
          </div>
        </div>
      </div>

    </>
  );
}
