import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ points, level }) {
  const progress = (points % 7) * 5; // 7 points per level

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      <div className="progress-text">
        Level {level} ({points % 7}/7 points)
      </div>
    </div>
  );
}