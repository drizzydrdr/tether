import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEntry } from '../lib/storage';
import './CheckIn.css';
import './MusicPrecommit.css';

// Music apps get opened constantly just to skip a song or check what's
// playing — asking every single time turns a helpful nudge into spam. This
// only actually asks once per cooldown window; any Music-open within that
// window silently passes through to Home instead.
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const LAST_KEY = 'tether:lastPrecommit';

export default function MusicPrecommit() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const last = Number(localStorage.getItem(LAST_KEY) || 0);
    if (Date.now() - last < COOLDOWN_MS) {
      navigate('/', { replace: true });
    } else {
      setReady(true);
    }
  }, [navigate]);

  function respond(intending) {
    addEntry({ state: 'precommit', trigger: 'music', intending });
    localStorage.setItem(LAST_KEY, String(Date.now()));
    setDone(true);
  }

  if (!ready) return null;

  if (done) {
    return (
      <div className="screen checkin">
        <div className="checkin__done">
          <div className="checkin__done-orb" />
          <h1>Noted.</h1>
          <p className="checkin__done-sub">Enjoy the music.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen checkin music-precommit">
      <p className="eyebrow">Before you press play</p>
      <h1 className="music-precommit__title">Listening with intention, or maybe drifting today?</h1>
      <div className="checkin__choices" style={{ marginTop: 20 }}>
        <button className="choice choice--wide" onClick={() => respond(true)}>
          <span className="choice__label">Just vibing</span>
          <span className="choice__hint">No plans to fight it, and that's fine</span>
        </button>
        <button className="choice choice--wide" onClick={() => respond(false)}>
          <span className="choice__label">I’ll probably drift</span>
          <span className="choice__hint">Noting it before it happens, not after</span>
        </button>
      </div>
    </div>
  );
}
