// Original short retellings — not quoted from any source, just the bones
// of stories that have been public for a couple thousand years. One shows
// per visit, chosen to occasionally remind the astronomy that it used to
// be a story too.
export const myths = [
  {
    title: 'Ursa Minor',
    text: 'The nymph Kallisto was placed in the sky by Zeus to keep her safe \u2014 and her son beside her, so neither would ever be alone again. The smaller bear still circles the pole star, closest of all to true north.',
  },
  {
    title: 'Orion',
    text: 'A hunter so certain of his own skill that he claimed no creature alive could beat him \u2014 until a scorpion, barely visible against the ground, proved otherwise. The two were set on opposite sides of the sky, so one always sets as the other rises.',
  },
  {
    title: 'The Pleiades',
    text: 'Seven sisters, pursued across the sky by Orion, were changed into stars to escape him \u2014 and are still visible fleeing just ahead of him each night, forever almost caught, never quite.',
  },
  {
    title: 'Polaris',
    text: 'Every other star seems to wheel through the night. Polaris barely moves at all \u2014 which is exactly why sailors, and everyone lost after dark, have used it to find their way home for as long as anyone has kept records.',
  },
  {
    title: 'Selene',
    text: 'The Greeks didn\u2019t see an empty rock when they looked at the moon \u2014 they saw a goddess driving it across the sky each night, deliberately, on a course she chose herself.',
  },
  {
    title: 'The Stoics',
    text: 'Centuries after the myths, philosophers in the same part of the world looked up at that same unmoved sky and decided a person could aim for something similar \u2014 steady, clear, undisturbed by whatever was passing through.',
  },
];

export function randomMyth() {
  return myths[Math.floor(Math.random() * myths.length)];
}
