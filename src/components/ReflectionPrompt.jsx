import { useState } from 'react';
import { addEntry } from '../lib/storage';
import { streakPrompt } from '../data/ladder';
import './ReflectionPrompt.css';

const SEEN_KEY = 'tether:reflectionSeen';

function dayKeyOf(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

// "Mostly present today" can't be measured the way it first was: manual
// Catch Myself entries are always tagged fantasy by design, so a ratio of
// reality-vs-total would almost never clear 70% no matter how good the day
// actually was. Two more honest signals instead:
//
//  1. Ping-answered entries are unbiased (the app didn't know the answer in
//     advance) — a mostly-present ping day is real evidence.
//  2. Absent enough ping data, compare today's manual fantasy-catches
//     against your own recent baseline — meaningfully fewer than usual is
//     itself the signal, independent of any "reality" tap.
export function shouldShowReflection(allEntries) {
  const todayKey = dayKeyOf(new Date().toISOString());
  if (localStorage.getItem(SEEN_KEY) === todayKey) return false;

  const real = allEntries.filter((e) => e.state === 'reality' || e.state === 'fantasy');
  const today = real.filter((e) => dayKeyOf(e.timestamp) === todayKey);

  const pingToday = today.filter((e) => e.source === 'ping');
  if (pingToday.length >= 2) {
    const presentPing = pingToday.filter((e) => e.state === 'reality').length;
    if (presentPing / pingToday.length >= 0.7) return true;
  }

  const manualFantasyToday = today.filter((e) => e.source !== 'ping' && e.state === 'fantasy').length;
  const priorDayCounts = {};
  real.forEach((e) => {
    const key = dayKeyOf(e.timestamp);
    if (key === todayKey || e.source === 'ping' || e.state !== 'fantasy') return;
    priorDayCounts[key] = (priorDayCounts[key] || 0) + 1;
  });
  const counts = Object.values(priorDayCounts);
  if (counts.length >= 3) {
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    if (avg >= 1 && manualFantasyToday <= avg / 2) return true;
  }

  return false;
}

function markSeen() {
  const todayKey = new Date().toISOString().slice(0, 10);
  localStorage.setItem(SEEN_KEY, todayKey);
}

export default function ReflectionPrompt({ onClose }) {
  const [text, setText] = useState('');

  function save() {
    if (text.trim()) {
      addEntry({ state: 'reflection', text: text.trim() });
    }
    markSeen();
    onClose();
  }

  function dismiss() {
    markSeen();
    onClose();
  }

  return (
    <div className="reflection">
      <div className="reflection__header">
        <span className="reflection__eyebrow">Today looked different</span>
        <button className="reflection__dismiss" onClick={dismiss} aria-label="Dismiss">×</button>
      </div>
      <p className="reflection__prompt">{streakPrompt}</p>
      <textarea
        className="reflection__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="No pressure to have an answer"
        rows={2}
      />
      <button className="reflection__save" onClick={save}>
        {text.trim() ? 'Save' : 'Skip'}
      </button>
    </div>
  );
}
