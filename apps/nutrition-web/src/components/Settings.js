import React, { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../api';
import PetSelector from './PetSelector';

export default function Settings() {
  const [prefs, setPrefs] = useState({ hideLeaderboard: false, hidePet: false });

  useEffect(() => {
    getUserPreferences().then(({ data }) => {
      setPrefs({
        hideLeaderboard: data.hideLeaderboard || false,
        hidePet: data.hidePet || false,
      });
    });
  }, []);

  const handleToggle = async (e) => {
    const { name, checked } = e.target;
    await updateUserPreferences({ [name]: checked });
    setPrefs((prev) => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <label className="block mb-2">
        <input
          type="checkbox"
          name="hideLeaderboard"
          checked={prefs.hideLeaderboard}
          onChange={handleToggle}
          className="mr-2"
        />
        Hide Leaderboard
      </label>
      <label className="block mb-4">
        <input
          type="checkbox"
          name="hidePet"
          checked={prefs.hidePet}
          onChange={handleToggle}
          className="mr-2"
        />
        Hide Pet Display
      </label>
      <PetSelector />
    </div>
  );
}
