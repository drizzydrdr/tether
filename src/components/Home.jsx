import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntries } from '../lib/storage';
import ReflectionPrompt, { shouldShowReflection } from './ReflectionPrompt';
import './Home.css';

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function Home() {
  const navigate = useNavigate();
  const allEntries = useMemo(() => getEntries(), []);
  const todayEntries = useMemo(
    () => allEntries.filter((e) => isToday(e.timestamp) && e.state !== 'reflection'),
    [allEntries]
  );
  const [showReflection, setShowReflection] = useState(() => shouldShowReflection(allEntries));

  const total = todayEntries.length;

  return (
    <div className="screen home">
      <p className="eyebrow">Tether</p>
      <h1 className="home__title">You're here right now.</h1>
      <p className="home__sub">That's all this needs to notice.</p>

      <div className="home__orb-wrap">
        <div
          className="home__orb"
          style={{ '--presence': Math.min(total / 5, 1) }}
        />
      </div>

      {total > 0 ? (
        <p className="home__stat">
          {total} check-in{total === 1 ? '' : 's'} today
        </p>
      ) : (
        <p className="home__stat home__stat--muted">No check-ins yet today. That's fine too.</p>
      )}

      <button className="home__catch-btn" onClick={() => navigate('/checkin?source=manual')}>
        <span className="home__catch-btn-label">Catch myself</span>
        <span className="home__catch-btn-sub">I noticed just now</span>
      </button>

      <button className="home__catch-btn home__catch-btn--secondary" onClick={() => navigate('/trigger-killer')}>
        <span className="home__catch-btn-label">Cut it off</span>
        <span className="home__catch-btn-sub">Before it takes hold</span>
      </button>

      {showReflection && <ReflectionPrompt onClose={() => setShowReflection(false)} />}
    </div>
  );
}
