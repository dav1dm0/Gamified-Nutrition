import React from 'react';

export default function PetDisplay({ level, petType }) {
  const stages = ['baby', 'teen', 'adult'];
  if (!petType) petType = 'cat';
  if (!level) level = 0;
  if (level > 2) level = 2;
  const imgSrc = `/meal-planner/images/${petType}-${stages[level]}.png`;

  return (
    <img
      src={imgSrc}
      alt={`${petType} level ${level}`}
      className="pet-img"
    />
  );
}
