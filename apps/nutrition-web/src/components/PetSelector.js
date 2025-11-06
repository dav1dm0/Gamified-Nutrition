import { useState, useEffect } from 'react';
import { updateUserPreferences } from '../api';
import Toast from './Toast';
import './PetSelector.css';

export default function PetSelector() {
  const [selectedPet, setSelectedPet] = useState('cat');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserPreferences({ petType: selectedPet });
      setToast({ message: 'Pet preference saved!', type: 'success' });
      // give the user a brief moment to see the toast then reload
      setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      console.error('Failed to save pet preference:', error);
      setToast({ message: 'Failed to save pet preference.', type: 'error' });
    }
  };

  const handleChange = (e) => {
    setSelectedPet(e.target.value);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="petselector-form">
        <h3 className="petselector-title">Choose your pet</h3>
        <div className="pet-options">
          <label className="pet-option">
            <input
              type="radio"
              name="pet"
              value="cat"
              checked={selectedPet === 'cat'}
              onChange={handleChange}
            />
            <span>Cat</span>
          </label>
          <label className="pet-option">
            <input
              type="radio"
              name="pet"
              value="dog"
              checked={selectedPet === 'dog'}
              onChange={handleChange}
            />
            <span>Dog</span>
          </label>
        </div>
        <button type="submit" className="petselector-save">Save</button>
      </form>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </>
  );
}


