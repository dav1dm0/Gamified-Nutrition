import React, { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../api';
import PetSelector from './PetSelector';
import './Settings.css';

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
    <div className="settings-container">
      <div className="settings-content">
        <h2 className="settings-title">Settings</h2>

        <div className="settings-field">
          <label>
            <input
              type="checkbox"
              name="hideLeaderboard"
              checked={prefs.hideLeaderboard}
              onChange={handleToggle}
              className="settings-checkbox"
            />
            <span className="settings-label">Hide Leaderboard</span>
          </label>
        </div>

        <div className="settings-field">
          <label>
            <input
              type="checkbox"
              name="hidePet"
              checked={prefs.hidePet}
              onChange={handleToggle}
              className="settings-checkbox"
            />
            <span className="settings-label">Hide Pet Display</span>
          </label>
        </div>

        <div className="settings-petselector">
          <PetSelector />
        </div>
      </div>
    </div>
  );
}
