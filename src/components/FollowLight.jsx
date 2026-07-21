import { useEffect, useRef, useState } from 'react';
import './FollowLight.css';

const SESSION_MS = 40000;
const HIT_RADIUS_PCT = 7;

export default function FollowLight({ onDone }) {
  const areaRef = useRef(null);
  const dotRef = useRef({ x: 50, y: 50 });
  const targetRef = useRef({ x: 50, y: 50 });
  const onTargetRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const audioCtxRef = useRef(null);
  const nextTickRef = useRef(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const holdMsRef = useRef(0);
  const lastFrameRef = useRef(null);

  const [dotStyle, setDotStyle] = useState({ left: '50%', top: '50%' });
  const [onTarget, setOnTarget] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [holdPct, setHoldPct] = useState(0);

  useEffect(() => {
    startRef.current = performance.now();
    lastFrameRef.current = startRef.current;
    let lastTargetPick = 0;

    function pickNewTarget() {
      const margin = 15;
      targetRef.current = {
        x: margin + Math.random() * (100 - margin * 2),
        y: margin + Math.random() * (100 - margin * 2),
      };
    }
    pickNewTarget();

    function loop(now) {
      const elapsed = now - startRef.current;
      const dt = now - lastFrameRef.current;
      lastFrameRef.current = now;

      if (elapsed >= SESSION_MS) {
        const finalPct = Math.round((holdMsRef.current / SESSION_MS) * 100);
        setHoldPct(finalPct);
        setFinished(true);
        return;
      }
      setProgress(Math.min(100, (elapsed / SESSION_MS) * 100));

      if (now - lastTargetPick > 1200 + Math.random() * 1300) {
        pickNewTarget();
        lastTargetPick = now;
      }

      const ease = 0.035;
      dotRef.current.x += (targetRef.current.x - dotRef.current.x) * ease;
      dotRef.current.y += (targetRef.current.y - dotRef.current.y) * ease;
      setDotStyle({ left: `${dotRef.current.x}%`, top: `${dotRef.current.y}%` });

      if (onTargetRef.current && pointerActiveRef.current) {
        holdMsRef.current += dt;
        if (now >= nextTickRef.current) {
          playTick();
          nextTickRef.current = now + 400 + Math.random() * 800;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function playTick() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // audio unavailable — visual pulse still gives feedback
    }
  }

  function updateFromPointer(e) {
    const rect = areaRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const dx = px - dotRef.current.x;
    const dy = py - dotRef.current.y;
    const hit = Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS_PCT;
    onTargetRef.current = hit;
    setOnTarget(hit);
  }

  function handlePointerDown(e) {
    e.target.setPointerCapture?.(e.pointerId);
    pointerActiveRef.current = true;
    updateFromPointer(e);
  }

  function handlePointerUp() {
    pointerActiveRef.current = false;
    onTargetRef.current = false;
    setOnTarget(false);
  }

  if (finished) {
    return (
      <div className="followlight__done">
        <p className="eyebrow">Done</p>
        <p className="checkin__wonder-text">Stayed on it {holdPct}% of the time.</p>
        <button
          className="choice choice--wide choice--selected"
          style={{ marginTop: 24 }}
          onClick={() => onDone(holdPct)}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="followlight">
      <p className="eyebrow">Follow the light</p>
      <p className="followlight__hint">Keep your finger on it</p>
      <div
        ref={areaRef}
        className="followlight__area"
        onPointerDown={handlePointerDown}
        onPointerMove={updateFromPointer}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className={`followlight__dot${onTarget && pointerActiveRef.current ? ' followlight__dot--tracked' : ''}`}
          style={dotStyle}
        />
      </div>
      <div className="followlight__progress">
        <div className="followlight__progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
