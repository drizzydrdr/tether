// The ladder shown when energy is low. No tier is "the failure option" —
// logging alone is a complete, valid response.

export const breathingTechnique = {
  // Placeholder — replace with your exact method in Settings.
  title: 'Breathe back',
  steps: [
    'In for 4',
    'Hold for 4',
    'Out for 6',
  ],
  rounds: 3,
};

export const microActions = [
  { id: 'feet', label: 'Feel your feet on the ground, nothing else' },
  { id: 'five-things', label: 'Notice five things you can actually see' },
  { id: 'exhale', label: 'One slow exhale, longer than feels natural' },
  { id: 'hands', label: 'Press your palms together for ten seconds' },
  { id: 'window', label: 'Look at something far away, out a window if you can' },
];

// Gentle, present-tense lines — no battle language, no "beat this."
// Shown at random when logging a low-energy moment.
export const gentleLines = [
  'You noticed. That\u2019s already the hard part, done.',
  'No need to fight it right now. Just stay a moment longer here.',
  'This doesn\u2019t need to be won today. Just seen.',
  'You\u2019re allowed to come back slowly.',
  'Still here. That counts.',
  'Nothing to prove right now — just breathe where you are.',
  'The world you\u2019re in isn\u2019t going anywhere. This one\u2019s asking for a minute, that\u2019s all.',
  'You came back once before. It\u2019s still in you.',
];

// Shown on a streak day, or after a gap of low activity — a small
// reflection, not an interrogation.
export const streakPrompt = 'What felt different today, if anything?';

// Your own reasoning tends to land harder than a stranger's. If you've
// written any "why" statements in Settings, this gives them even odds of
// showing up alongside the built-in gentle lines — never fully replacing
// them, since some days a neutral line is what fits.
export function pickGentleLine(customLines = []) {
  if (customLines.length > 0 && Math.random() < 0.5) {
    return { text: customLines[Math.floor(Math.random() * customLines.length)], mine: true };
  }
  return { text: gentleLines[Math.floor(Math.random() * gentleLines.length)], mine: false };
}
