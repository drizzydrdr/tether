import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// --- Filled in from your Firebase project settings ---
const firebaseConfig = {
  apiKey: "AIzaSyDRCDF9q2sRxm0wWF1uXxRyGZ1hJKJwvZ4",
  authDomain: "tether-b171c.firebaseapp.com",
  projectId: "tether-b171c",
  storageBucket: "tether-b171c.firebasestorage.app",
  messagingSenderId: "779714006487",
  appId: "1:779714006487:web:ea4b370c389b16917e8f92",
  measurementId: "G-E668RDZ266",
};

const VAPID_KEY = 'BFAXAZLopaIiibp9fgKS2YzMZ9FxhVMJYpWnQvPykCQe2jgRQO4RKWtLA56LKLsdtGefezSkv_XQvB2Pkr3ggY4';

let app;
function getApp() {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

// Registers this device for push and stores ONLY the token (an address,
// not your data) in Firestore, so the GitHub Actions scheduler knows
// where to send a ping. Your check-in entries never touch this.
export async function registerForNotifications() {
  const supported = await isSupported();
  if (!supported) return { ok: false, reason: 'unsupported' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  try {
    const messaging = getMessaging(getApp());

    // Firebase needs its OWN service worker registration — reusing whatever
    // SW happens to be active (e.g. the PWA's caching worker) doesn't work.
    const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
    let registration = await navigator.serviceWorker.getRegistration(swUrl);
    if (!registration) {
      registration = await navigator.serviceWorker.register(swUrl);
    }
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return { ok: false, reason: 'no-token' };

    const db = getFirestore(getApp());
    await setDoc(doc(db, 'devices', token), {
      token,
      updatedAt: new Date().toISOString(),
    });

    localStorage.setItem('tether:pushToken', token);
    return { ok: true, token };
  } catch (err) {
    console.error('Notification registration failed', err);
    return { ok: false, reason: 'error', message: err.message };
  }
}

// Notification prefs (window, pings/day, paused) live in localStorage for
// the app itself, but the GitHub Actions scheduler runs outside your phone
// and needs to read them too — so a copy is mirrored to the same Firestore
// doc as the push token. No check-in content is ever included here.
export async function syncNotificationPrefs(prefs) {
  const token = localStorage.getItem('tether:pushToken');
  if (!token) return { ok: false, reason: 'not-registered' };

  try {
    const db = getFirestore(getApp());
    await setDoc(
      doc(db, 'devices', token),
      {
        notifyStart: prefs.notifyStart,
        notifyEnd: prefs.notifyEnd,
        pingsPerDay: prefs.pingsPerDay,
        paused: prefs.paused,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { ok: true };
  } catch (err) {
    console.error('Prefs sync failed', err);
    return { ok: false, reason: 'error', error: err };
  }
}
