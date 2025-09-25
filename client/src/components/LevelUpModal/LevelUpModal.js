
import React from 'react';
import './LevelUpModal.css';

export default function LevelUpModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <h2 className="text-3xl font-bold mb-4 text-green-600 animate-bounce">
          🎉 Level Up! 🎉
        </h2>
        <p className="text-lg mb-6">Your pet has significantly grown!</p>
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition duration-300"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
} 