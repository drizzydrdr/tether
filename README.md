# Tether

A quiet check-in for maladaptive daydreaming — notices the pattern instead of fighting it.

Everything you log stays on your phone (localStorage). The only thing that leaves your
device is a push token and your notification window, so a scheduler can know when to
ping you. Your check-in content — themes, needs, energy — never touches a server.

---

## 1. Firebase (already configured)

Your Firebase config and VAPID key are already baked into `src/lib/firebase.js` and
`public/firebase-messaging-sw.js` — nothing to paste in. You'll only need to touch the
Firebase console for two one-time setup steps if you haven't already:

### Enable Cloud Messaging
Project settings → Cloud Messaging → Web configuration → confirm a Web Push certificate
(VAPID key pair) exists.

### Enable Firestore
1. **Build → Firestore Database → Create database** → production mode, any region.
2. **Rules** tab:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /devices/{deviceId} {
         allow read: if false;
         allow write: if true;
       }
     }
   }
   ```

### Generate a service account key (for the GitHub Actions scheduler)
**Project settings → Service accounts → Generate new private key** → downloads a JSON
file. Paste its full contents into the `FIREBASE_SERVICE_ACCOUNT` GitHub secret (step 3).

---

## 2. Push the code to GitHub

```bash
cd tether
git init
git add .
git commit -m "Initial Tether build"
gh repo create tether --public --source=. --push
# or create the repo on github.com and follow its "push an existing repo" instructions
```

---

## 3. Configure GitHub

**Settings → Pages** → Source: **GitHub Actions**.

**Settings → Secrets and variables → Actions**:
- New **repository secret** → name `FIREBASE_SERVICE_ACCOUNT` → paste the *entire contents* of the service account JSON file from step 1.
- New **repository variable** → name `TIMEZONE_OFFSET_HOURS` → your UTC offset as a number (e.g. `2` or `3` for Egypt depending on the time of year). This is what lets the scheduler compare "now" to your notification window correctly.

Push to `main` and the **Deploy to GitHub Pages** workflow will build and publish automatically. Your app will be live at `https://yourusername.github.io/tether/`.

If your repo name isn't `tether`, update `base` in `vite.config.js` and the icon/manifest paths in `index.html` to match.

---

## 4. Install it on your iPhone

1. Open the deployed URL in **Safari** (must be Safari, not Chrome, for iOS install).
2. Tap the **Share** icon → **Add to Home Screen**.
3. Open Tether from the home screen icon (not Safari) — this is what makes it "installed" rather than a browser tab, and is required for push notifications to work.
4. Go to **Settings → Enable check-in pings** inside the app, and accept the notification permission prompt.

---

## 5. Test the scheduler

Go to your repo's **Actions** tab → **Notification scheduler** → **Run workflow** to trigger it manually instead of waiting for the cron. Check the run logs — it'll tell you how many devices it checked and whether it sent anything (it only sends if the random roll and your notification window line up, so a manual run won't always fire — that's expected).

---

## 6. Music pre-commit (optional)

True Apple Music integration needs MusicKit, which needs a paid Apple Developer
account — skipped for the same reason we skipped the $99/yr native app path. This
gets you the same practical outcome for free, using iOS Shortcuts:

1. Open the **Shortcuts** app → **Automation** tab → **+** → **Create Personal Automation**.
2. Choose **App** → select **Music** (or Spotify, if that's what you actually use) → **Is Opened**.
3. Add action: **Open URLs** → `https://yourusername.github.io/tether/#/music`
4. Turn **off** "Ask Before Running" so it fires silently.

One caveat: this opens in Safari, not the installed home-screen app (iOS Shortcuts
can't launch an installed PWA directly), so it'll feel like a browser tab popping up
rather than your app. Functionally it's the same one-tap flow either way.

## Notes

- The 20-minute cron interval is a balance between GitHub Actions' minimum practical
  granularity and not hammering the API — it doesn't mean pings are exactly 20 minutes
  apart, just that's how often the scheduler *rolls the dice*.
- If you ever want zero server dependency at all, the app still works fully offline —
  you'd just lose the random pings and rely on the Catch Myself button alone.
- Your `breathing` technique and `storylines` are editable in-app (Settings) — they're
  seeded from what you described, not fixed.
