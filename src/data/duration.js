// Rough duration buckets — not meant to be precise, just enough to see
// whether time spent is trending up or down. Minutes values are the
// representative estimate used for the History time-spent stats.
export const durations = [
  { id: 'under5', label: 'Under 5 min', minutes: 3 },
  { id: '5to15', label: '5-15 min', minutes: 10 },
  { id: '15to30', label: '15-30 min', minutes: 22 },
  { id: '30to60', label: '30-60 min', minutes: 45 },
  { id: '1to2h', label: '1-2 hours', minutes: 90 },
  { id: '2hplus', label: '2+ hours', minutes: 150 },
];
