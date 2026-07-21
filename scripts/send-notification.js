// Runs on a GitHub Actions cron. Reads only push tokens + notification
// prefs from Firestore (never check-in content, which stays on-device).
// Decides randomly whether *this* run should send a ping, calibrated so
// the expected number of pings per day matches what you set in-app.

import admin from 'firebase-admin';

const RUN_INTERVAL_MINUTES = 20; // must match the cron schedule in notify.yml
const TIMEZONE_OFFSET_HOURS = Number(process.env.TIMEZONE_OFFSET_HOURS || '0');

const PROMPTS = [
  'Where are you right now?',
  'Quick check — here, or elsewhere?',
  'A small pause. Reality or somewhere else?',
  'Just noticing. What\u2019s actually happening right now?',
];

function nowInLocalMinutes() {
  const utc = new Date();
  const local = new Date(utc.getTime() + TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function shouldSend(device) {
  if (device.paused) return false;

  const start = toMinutes(device.notifyStart || '08:00');
  const end = toMinutes(device.notifyEnd || '23:00');
  const nowMin = nowInLocalMinutes();
  if (nowMin < start || nowMin > end) return false;

  const windowMinutes = Math.max(end - start, RUN_INTERVAL_MINUTES);
  const runsInWindow = windowMinutes / RUN_INTERVAL_MINUTES;
  const pingsPerDay = device.pingsPerDay || 5;
  const probability = Math.min(pingsPerDay / runsInWindow, 1);

  return Math.random() < probability;
}

async function main() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  const db = admin.firestore();
  const snapshot = await db.collection('devices').get();

  if (snapshot.empty) {
    console.log('No registered devices yet.');
    return;
  }

  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  let sent = 0;

  for (const docSnap of snapshot.docs) {
    const device = docSnap.data();
    if (!shouldSend(device)) continue;

    try {
      await admin.messaging().send({
        token: device.token,
        notification: { title: 'Tether', body: prompt },
        webpush: { fcmOptions: { link: '/tether/#/checkin?source=ping' } },
      });
      sent += 1;
    } catch (err) {
      console.error(`Failed to send to a device: ${err.message}`);
      // Token likely expired/invalid — clean it up so future runs skip it.
      if (err.code === 'messaging/registration-token-not-registered') {
        await docSnap.ref.delete();
      }
    }
  }

  console.log(`Checked ${snapshot.size} device(s), sent ${sent} notification(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
