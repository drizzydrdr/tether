export const manifesto = `You built this because some part of you got tired of living somewhere that doesn't exist. That part of you deserves credit, not shame — noticing was always the hardest part.

Nothing you're imagining is coming to save you. What's real is already here, waiting for you to show up for it. You don't need to be admired, powerful, or chosen to matter — you already do, right now, exactly as you are.

This isn't a fight against yourself. It's a slow return to a life that's actually yours: imperfect, unscripted, and real in a way no fantasy can ever be.

Stay. That's the whole practice.`;

// Your own lines, reformatted into standalone quote-card form — unattributed,
// since they're yours. Stoic lines mixed in where the theme genuinely fits
// (public-domain translations, kept short and unmodified in meaning).
export const quotes = [
  { text: 'It\u2019s not real. It never was.', author: '' },
  { text: 'It doesn\u2019t actually feel good \u2014 not really, not after.', author: '' },
  { text: 'Every minute spent there is a minute stolen from your actual life.', author: '' },
  { text: 'Take control. You are allowed to.', author: '' },
  { text: 'Remember what it took from you. Let that be the reason, not the shame.', author: '' },
  { text: 'Whatever you\u2019re chasing there, you can build here, for real.', author: '' },
  { text: 'You don\u2019t need the fantasy to deserve love. You already do.', author: '' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'Men are disturbed not by things, but by the view which they take of them.', author: 'Epictetus' },
  { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'Confine yourself to the present.', author: 'Marcus Aurelius' },
];

export function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
