import React, { useState, useEffect } from 'react';
import { getUserPreferences, updateUserPreferences } from '../../api';
import PetSelector from '../../components/PetSelector';
import Toast from '../../components/Toast';
import './Settings.css';

export default function Settings() {
  const [prefs, setPrefs] = useState({ hideLeaderboard: false, hidePet: false });
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    getUserPreferences().then(({ data }) => {
      setPrefs({
        hideLeaderboard: data.hideLeaderboard || false,
        hidePet: data.hidePet || false,
      });
    }).catch((err) => {
      console.error('Failed to load preferences:', err);
      setToast({ message: 'Failed to load preferences', type: 'error' });
    });
  }, []);

  const handleToggle = async (e) => {
    const { name, checked } = e.target;
    try {
      await updateUserPreferences({ [name]: checked });
      setPrefs((prev) => ({ ...prev, [name]: checked }));
      setToast({ message: 'Preferences saved', type: 'success' });
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setToast({ message: 'Failed to save preferences', type: 'error' });
    }
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

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
