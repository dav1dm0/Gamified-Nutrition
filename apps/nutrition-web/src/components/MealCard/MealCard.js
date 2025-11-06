import React from 'react';
import './MealCard.css';

export default function MealCard({ meal, onReplace }) {
  return (
    <div className="meal-card">
      <img src={meal.image} alt={meal.title} />
      <div className="meal-card-content">
        <h3>{meal.title}</h3>
        <p className="meal-meta">{meal.readyInMinutes} min</p>
        <button className="meal-replace" onClick={onReplace}>Replace</button>
      </div>
    </div>
  );
}
