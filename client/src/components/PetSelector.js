import { useState, useEffect } from 'react';
import { getUserProfile, setPet, getPet } from '../api';

export default function PetSelector() {
  const [petType, setPetType] = useState('cat');

  useEffect(() => {
    getUserProfile().then(({ data }) => {
      if (data.petType) setPetType(data.petType);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await setPet({ petType });
  };

  return (
    <form onSubmit={handleSave} className="p-4">
      <h3 className="text-xl font-semibold mb-2">Choose your pet</h3>
      <label className="inline-flex items-center mr-4">
        <input
          type="radio"
          name="pet"
          value="cat"
          checked={petType === 'cat'}
          onChange={(e) => setPetType(e.target.value)}
          className="mr-1"
        />
        Cat
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="pet"
          value="dog"
          checked={petType === 'dog'}
          onChange={(e) => setPetType(e.target.value)}
          className="mr-1"
        />
        Dog
      </label>
      <button
        type="submit"
        className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </form>
  );
}
