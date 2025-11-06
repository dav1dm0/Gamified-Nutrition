import React, { useState, useEffect } from 'react';
import MealCard from '../../components/MealCard/MealCard';
import mealsData from '../../data/meals.json';
import './MealsPage.css';

export default function MealsPage() {
    const [meals, setMeals] = useState([]);

    useEffect(() => {
        // Initialize 3 random meals (one for each time of day)
        const times = ['Breakfast', 'Lunch', 'Dinner'];
        const randomMeals = times.map((time) => {
            const options = mealsData.filter((m) => m.timeOfDay === time);
            return options[Math.floor(Math.random() * options.length)];
        });
        setMeals(randomMeals);
    }, []);

    const replaceMeal = (index) => {
        const time = meals[index].timeOfDay;
        // Ensure we don't select the same meal again
        const options = mealsData.filter((m) => m.timeOfDay === time && m.id !== meals[index].id);
        const replacement = options[Math.floor(Math.random() * options.length)];
        setMeals((prev) => {
            const updated = [...prev];
            updated[index] = replacement;
            return updated;
        });
    };

    return (
        <div className="meals-container">
            <div className="meals-content">
                <h1 className="meals-title">Today&apos;s Meals</h1>
                <p className="meals-sub">Here are your suggested meals for the day. Click "Replace" to get a new suggestion for that mealtime.</p>

                <div className="meals-grid">
                    {meals.map((meal, idx) => (
                        <MealCard key={meal.id} meal={meal} onReplace={() => replaceMeal(idx)} />
                    ))}
                </div>
            </div>
        </div>
    );
}