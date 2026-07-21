// The recurring "worlds" — editable in Settings so the app adapts to you,
// not the other way around. Seeded from what you actually described.
export const defaultStorylines = [
  {
    id: 'footballer',
    label: 'The footballer',
    hint: 'Amazing, rich, mysterious — scoring, mattering, being watched',
  },
  {
    id: 'work',
    label: 'Work, elevated',
    hint: 'More important, more connected than the real version',
  },
  {
    id: 'random',
    label: 'Heat of the moment',
    hint: 'A conversation or interaction replayed or reimagined',
  },
  {
    id: 'crush',
    label: 'Her, alone',
    hint: 'When it\u2019s just about her, not folded into another world',
  },
  {
    id: 'other',
    label: 'Something else',
    hint: 'Doesn\u2019t fit the usual ones',
  },
];

// A cross-cutting flag, not a fifth storyline — she shows up inside the
// others too, so this is asked independently of which world it was.
export const presenceFlag = {
  id: 'she_present',
  label: 'Was she part of it?',
};
