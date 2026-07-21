// Moon phase — deterministic astronomy, no API needed, always available
// even offline. Reference new moon: 2000-01-06 18:14 UTC.
const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export function getMoonPhase(date = new Date()) {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const cycles = diffDays / SYNODIC_MONTH;
  const fraction = cycles - Math.floor(cycles); // 0..1 through the cycle

  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * fraction)) / 2) * 100);

  let name;
  if (fraction < 0.03 || fraction > 0.97) name = 'New Moon';
  else if (fraction < 0.22) name = 'Waxing Crescent';
  else if (fraction < 0.28) name = 'First Quarter';
  else if (fraction < 0.47) name = 'Waxing Gibbous';
  else if (fraction < 0.53) name = 'Full Moon';
  else if (fraction < 0.72) name = 'Waning Gibbous';
  else if (fraction < 0.78) name = 'Last Quarter';
  else name = 'Waning Crescent';

  return { name, illumination, fraction };
}

// Days until the next full moon — derived from the same phase fraction,
// no new astronomy needed.
export function daysToNextFullMoon(date = new Date()) {
  const { fraction } = getMoonPhase(date);
  const toFull = ((0.5 - fraction) + 1) % 1;
  return Math.round(toFull * SYNODIC_MONTH);
}

export function moonTrend(date = new Date()) {
  const { fraction } = getMoonPhase(date);
  return fraction < 0.5 ? 'waxing' : 'waning';
}

// Sunrise/sunset — standard NOAA solar position formula (Meeus). Accurate
// to within a few minutes, which is plenty for a mood briefing rather than
// a navigation tool. Needs lat/lon; no API, pure math.
export function getSunTimes(date, lat, lon) {
  const rad = Math.PI / 180;
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((date - start) / 86400000);
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (date.getUTCHours() - 12) / 24);

  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const zenith = 90.833 * rad;
  const latRad = lat * rad;
  const cosHA =
    (Math.cos(zenith) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
  if (cosHA > 1 || cosHA < -1) return null; // polar day/night edge case

  const ha = Math.acos(cosHA) / rad;
  const solarNoonUTCMin = 720 - 4 * lon - eqTime;
  const sunriseUTCMin = solarNoonUTCMin - 4 * ha;
  const sunsetUTCMin = solarNoonUTCMin + 4 * ha;

  function toDate(utcMin) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCMinutes(((utcMin % 1440) + 1440) % 1440);
    return d;
  }

  return { sunrise: toDate(sunriseUTCMin), sunset: toDate(sunsetUTCMin) };
}

// One-time location request, cached — never asked again unless cleared.
const LOCATION_KEY = 'tether:location';

export function getCachedLocation() {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function requestLocation() {
  return new Promise((resolve) => {
    const cached = getCachedLocation();
    if (cached) return resolve(cached);
    if (!navigator.geolocation) return resolve(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
        resolve(loc);
      },
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}

function fmtRelative(target, now) {
  const diffMin = Math.round((target.getTime() - now.getTime()) / 60000);
  const abs = Math.abs(diffMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const span = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return diffMin >= 0 ? `in ${span}` : `${span} ago`;
}

// Composes the sun + moon data into a short, readable briefing rather than
// raw stats.
export function buildSkyBriefing(now, loc) {
  const moon = getMoonPhase(now);
  const trend = moonTrend(now);
  const daysToFull = daysToNextFullMoon(now);
  const lines = [];

  if (loc) {
    const sun = getSunTimes(now, loc.lat, loc.lon);
    if (sun) {
      if (now < sun.sunrise) {
        lines.push(`The sun rises ${fmtRelative(sun.sunrise, now)}.`);
      } else if (now < sun.sunset) {
        lines.push(`The sun sets ${fmtRelative(sun.sunset, now)}.`);
      } else {
        lines.push(`The sun set ${fmtRelative(sun.sunset, now)}.`);
      }
    }
  }

  lines.push(
    `The moon is ${moon.illumination}% lit and ${trend}` +
      (daysToFull === 0 ? ', full tonight.' : `, ${daysToFull} day${daysToFull === 1 ? '' : 's'} to full.`)
  );

  return lines.join(' ');
}
// NASA's Astronomy Picture of the Day — real photos, changes once daily.
// Works out of the box with the shared DEMO_KEY (rate-limited across
// everyone using it); a free personal key from api.nasa.gov removes that
// limit. Cached per-day so it's fetched at most once regardless of how
// often this screen opens.
const APOD_CACHE_KEY = 'tether:apod';

export async function getTodaysApod(apiKey) {
  const todayKey = new Date().toISOString().slice(0, 10);
  let cached = null;
  try {
    cached = JSON.parse(localStorage.getItem(APOD_CACHE_KEY) || 'null');
  } catch {
    cached = null;
  }
  if (cached && cached.date === todayKey) return cached.data;

  const key = apiKey || 'DEMO_KEY';
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`);
    if (!res.ok) throw new Error(`APOD request failed: ${res.status}`);
    const data = await res.json();
    localStorage.setItem(APOD_CACHE_KEY, JSON.stringify({ date: todayKey, data }));
    return data;
  } catch (err) {
    console.error('APOD fetch failed', err);
    return cached ? cached.data : null;
  }
}
