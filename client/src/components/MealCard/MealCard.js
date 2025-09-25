import React from 'react';
import './MealCard.css';

export default function MealCard({ meal, onReplace }) {
  return (
    <div className="card">
      <img src= {"/meal-planner/" + meal.image} alt={meal.title} />
      <h3>{meal.title}</h3>
      <p>{meal.readyInMinutes} min</p>
      <button onClick={onReplace}>Replace</button>
    </div>
  );
}
