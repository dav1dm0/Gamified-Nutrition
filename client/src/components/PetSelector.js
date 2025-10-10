import { useState, useEffect } from 'react';
import { updateUserPreferences } from '../api';

export default function PetSelector() {
  const [selectedPet, setSelectedPet] = useState('cat');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserPreferences({ petType: selectedPet });
      alert('Pet preference saved!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to save pet preference:', error);
      alert('Failed to save pet preference.');
    }
  };

  const handleChange = (e) => {
    setSelectedPet(e.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="p-4">
      <h3 className="text-xl font-semibold mb-2">Choose your pet</h3>
      <label className="inline-flex items-center mr-4">
        <input
          type="radio"
          name="pet"
          value="cat"
          checked={selectedPet === 'cat'}
          onChange={handleChange}
          className="mr-1"
        />
        Cat
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="pet"
          value="dog"
          checked={selectedPet === 'dog'}
          onChange={handleChange}
          className="mr-1"
        />
        Dog
      </label>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mt-4"
      >
        Save
      </button>
    </form>
  );
}


