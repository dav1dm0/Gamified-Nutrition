import React, { useState, useEffect } from 'react';
import MealCard from '../../components/MealCard/MealCard';
import mealsData from '../../data/meals.json';

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
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Today's Meals</h1>
            <p className="text-gray-600 mb-6">Here are your suggested meals for the day. Click "Replace" to get a new suggestion for that mealtime.</p>
            <div className="grid gap-6 md:grid-cols-3">
                {meals.map((meal, idx) => (
                    <MealCard key={meal.id} meal={meal} onReplace={() => replaceMeal(idx)} />
                ))}
            </div>
        </div>
    );
}