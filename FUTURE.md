# Future ideas — not built yet, just tracked

## Phantom Vision integration
Same origin (`drizzydrdr.github.io`), so both apps technically share a
localStorage bucket already — worth verifying this actually holds once both
are installed as separate standalone home-screen icons on iOS before
building anything on top of the assumption (there's precedent for iOS
treating installed PWAs as more isolated than regular same-origin tabs).

- **Primary idea**: every successful Trigger Killer use (`outcome: 'worked'`)
  adds **+0.25 to all four Phantom Vision stats** (Knowledge, Guts,
  Proficiency, Charm) — a real interrupt becomes real XP in the same
  character sheet as the rest of the habit system. Thematically exact:
  changing your own heart is a Phantom Thief move.
- Secondary: a simple cross-link between the two apps so they feel like one
  system.
- Secondary: cross-reference whether Phantom Vision progress correlates
  with fewer Tether episodes over time — actual evidence for whether
  building the real thing is displacing the fantasy.

## Other deferred items
- **Export/backup** — everything still lives in one phone's localStorage
  only. Tabled early, never revisited.
- **Calendar's data problem** — the presence-ratio heatmap depends on
  ping-answered "reality" entries, which mostly stop existing now that
  logging is manual-only. Worth reconsidering what the Calendar should
  actually visualize given that.
