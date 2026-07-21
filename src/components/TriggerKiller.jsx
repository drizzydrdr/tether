import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { randomWonderPrompt } from '../data/wonder';
import { addEntry } from '../lib/storage';
import './CheckIn.css';

export default function TriggerKiller() {
  const navigate = useNavigate();
  const [wonder, setWonder] = useState(randomWonderPrompt);
  const [pendingOutcome, setPendingOutcome] = useState(false);

  function finish(outcome) {
    addEntry({ state: 'preempted', tool: 'wonder', outcome });
    navigate('/');
  }

  return (
    <div className="screen checkin">
      <div className="checkin__step" style={{ justifyContent: 'center', textAlign: 'center', alignItems: 'center' }}>
        {!pendingOutcome && (
          <>
            <p className="eyebrow">Before it starts</p>
            <p className="checkin__wonder-text">{wonder.text}</p>
            <div className="checkin__choices checkin__choices--two" style={{ marginTop: 32, width: '100%' }}>
              <button className="choice choice--wide" onClick={() => setWonder(randomWonderPrompt())}>Another one</button>
              <button className="choice choice--wide choice--selected" onClick={() => setPendingOutcome(true)}>Done</button>
            </div>
          </>
        )}

        {pendingOutcome && (
          <>
            <p className="eyebrow">One more thing</p>
            <p className="checkin__wonder-text">Did it work?</p>
            <div className="checkin__choices checkin__choices--two" style={{ marginTop: 28, width: '100%' }}>
              <button className="choice choice--wide choice--selected" onClick={() => finish('worked')}>Stopped it</button>
              <button className="choice choice--wide" onClick={() => finish('notWorked')}>Still pulled</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
