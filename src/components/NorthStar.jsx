import { useEffect, useRef, useState } from 'react';
import {
  getMoonPhase,
  getTodaysApod,
  buildSkyBriefing,
  getCachedLocation,
  requestLocation,
} from '../data/cosmos';
import { manifesto, randomQuote } from '../data/manifesto';
import { randomMyth } from '../data/myths';
import { getSettings } from '../lib/storage';
import './NorthStar.css';

function Reveal({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal${visible ? ' reveal--visible' : ''}`}>
      {children}
    </div>
  );
}

function ConstellationMark() {
  // Ursa Minor / Little Dipper — Polaris at the tip of the handle, the same
  // star the app is named for.
  const stars = [
    [8, 15, 2.2],
    [22, 20, 1],
    [35, 28, 1],
    [48, 32, 1.3],
    [65, 25, 1.4],
    [70, 42, 1],
    [50, 48, 1],
  ];
  return (
    <svg className="northstar__constellation" viewBox="0 0 100 60" aria-hidden="true">
      <polyline
        points="8,15 22,20 35,28 48,32 65,25 70,42 50,48 48,32"
        fill="none"
        stroke="rgba(233,231,245,0.35)"
        strokeWidth="0.6"
      />
      {stars.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i === 0 ? '#E8C97A' : 'rgba(233,231,245,0.85)'} />
      ))}
    </svg>
  );
}

export default function NorthStar() {
  const [quote, setQuote] = useState(randomQuote);
  const [quoteKey, setQuoteKey] = useState(0);
  const [apod, setApod] = useState(null);
  const [apodLoading, setApodLoading] = useState(true);
  const [briefing, setBriefing] = useState('');
  const [myth] = useState(randomMyth);
  const moon = getMoonPhase();

  useEffect(() => {
    const settings = getSettings();
    getTodaysApod(settings.nasaApiKey).then((data) => {
      setApod(data);
      setApodLoading(false);
    });
  }, []);

  useEffect(() => {
    const cached = getCachedLocation();
    setBriefing(buildSkyBriefing(new Date(), cached));
    if (!cached) {
      requestLocation().then((loc) => {
        if (loc) setBriefing(buildSkyBriefing(new Date(), loc));
      });
    }
  }, []);

  function shuffleQuote() {
    setQuote(randomQuote());
    setQuoteKey((k) => k + 1);
  }

  return (
    <div className="screen northstar">
      <div className="northstar__starfield">
        <ConstellationMark />
      </div>

      <p className="eyebrow">North Star</p>
      <h1 className="northstar__title">{moon.name} · {moon.illumination}% lit</h1>
      {briefing && <p className="northstar__briefing">{briefing}</p>}

      <div className="northstar__moon" style={{ '--illum': moon.illumination }} />

      <div className="northstar__meander" aria-hidden="true" />

      <Reveal>
        {apodLoading && <p className="northstar__loading">Pulling tonight's sky…</p>}
        {!apodLoading && apod && apod.media_type === 'image' && (
          <div className="northstar__apod">
            <img src={apod.url} alt={apod.title} />
            <p className="northstar__apod-title">{apod.title}</p>
            {apod.explanation && <p className="northstar__apod-explanation">{apod.explanation}</p>}
          </div>
        )}
        {!apodLoading && (!apod || apod.media_type !== 'image') && (
          <p className="northstar__fallback">This is real, right now, whether you're looking or not.</p>
        )}
      </Reveal>

      <div className="northstar__meander" aria-hidden="true" />

      <Reveal>
        <button className="northstar__quote-card" onClick={shuffleQuote}>
          <p className="northstar__quote-text" key={quoteKey}>“{quote.text}”</p>
          {quote.author && <p className="northstar__quote-author">— {quote.author}</p>}
          <p className="northstar__quote-hint">Tap to shuffle</p>
        </button>
      </Reveal>

      <Reveal>
        <div className="northstar__myth">
          <p className="eyebrow">{myth.title}</p>
          <p className="northstar__myth-text">{myth.text}</p>
        </div>
      </Reveal>

      <div className="northstar__meander" aria-hidden="true" />

      <Reveal>
        <div className="northstar__manifesto">
          <p className="eyebrow">Manifesto</p>
          <p className="northstar__manifesto-text">{manifesto}</p>
        </div>
      </Reveal>
    </div>
  );
}
