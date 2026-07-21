import { useState } from 'react';
import { getSettings, updateSettings, clearAllEntries } from '../lib/storage';
import { registerForNotifications, syncNotificationPrefs } from '../lib/firebase';
import './Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState(getSettings());
  const [notifStatus, setNotifStatus] = useState(() =>
    localStorage.getItem('tether:pushToken') ? 'enabled' : 'idle'
  );
  const [notifDetail, setNotifDetail] = useState('');

  function save(patch) {
    const next = updateSettings(patch);
    setSettings(next);
    if ('notifyStart' in patch || 'notifyEnd' in patch || 'pingsPerDay' in patch || 'paused' in patch) {
      syncNotificationPrefs(next);
    }
  }

  async function handleEnableNotifications() {
    setNotifStatus('working');
    const result = await registerForNotifications();
    if (result.ok) {
      setNotifStatus('enabled');
    } else {
      setNotifStatus('error');
      setNotifDetail(
        result.reason === 'unsupported' ? 'This browser/mode doesn\u2019t support push \u2014 make sure you opened Tether from the Home Screen icon, not Safari.' :
        result.reason === 'denied' ? 'Notification permission was denied. Check iOS Settings \u2192 Tether \u2192 Notifications.' :
        result.reason === 'no-token' ? 'Firebase didn\u2019t return a token \u2014 double check the VAPID key in firebase.js.' :
        result.message || 'Unknown error \u2014 check the browser console.'
      );
      console.log('Tether notification error detail:', result);
    }
  }

  return (
    <div className="screen settings">
      <p className="eyebrow">Settings</p>
      <h1>Make this yours</h1>

      <section className="settings__section">
        <h2>Notifications</h2>
        <button
          className={`settings__notif-btn settings__notif-btn--${notifStatus}`}
          onClick={handleEnableNotifications}
          disabled={notifStatus === 'working' || notifStatus === 'enabled'}
        >
          {notifStatus === 'enabled' ? 'Notifications on' :
           notifStatus === 'working' ? 'Enabling…' :
           notifStatus === 'error' ? "Couldn't enable — tap to retry" :
           'Enable check-in pings'}
        </button>
        {notifStatus === 'error' && notifDetail && (
          <p className="settings__error-detail">{notifDetail}</p>
        )}

        <div className="settings__row">
          <label>Window start</label>
          <input
            type="time"
            value={settings.notifyStart}
            onChange={(e) => save({ notifyStart: e.target.value })}
          />
        </div>
        <div className="settings__row">
          <label>Window end</label>
          <input
            type="time"
            value={settings.notifyEnd}
            onChange={(e) => save({ notifyEnd: e.target.value })}
          />
        </div>
        <div className="settings__row">
          <label>Pings per day</label>
          <input
            type="number"
            min="1"
            max="12"
            value={settings.pingsPerDay}
            onChange={(e) => save({ pingsPerDay: Number(e.target.value) })}
          />
        </div>

        <button
          className={`settings__pause-btn${settings.paused ? ' settings__pause-btn--active' : ''}`}
          onClick={() => save({ paused: !settings.paused })}
        >
          {settings.paused ? 'Paused — tap to resume' : 'Pause notifications'}
        </button>
      </section>

      <section className="settings__section">
        <h2>North Star sky photo</h2>
        <p className="settings__hint">
          Optional — a free personal key from api.nasa.gov removes the shared rate limit on
          the daily sky photo. Leave blank to use the shared demo key.
        </p>
        <input
          className="settings__text-input"
          value={settings.nasaApiKey}
          onChange={(e) => save({ nasaApiKey: e.target.value })}
          placeholder="NASA API key (optional)"
        />
      </section>

      <section className="settings__section">
        <h2>Data</h2>
        <p className="settings__hint">Everything you log stays on this device only.</p>
        <button
          className="settings__danger-btn"
          onClick={() => {
            if (confirm('Clear all logged check-ins? This can\u2019t be undone.')) {
              clearAllEntries();
            }
          }}
        >
          Clear all entries
        </button>
      </section>
    </div>
  );
}
