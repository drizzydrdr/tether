// A different mechanism than breathing or micro-actions: these ask for
// actual thought, which is harder to sustain alongside an immersive
// daydream. Mix of riddle, perception, and philosophical types for variety.
// Large bank on purpose so repeats are rare.

export const wonderPrompts = [
  // --- riddle ---
  { type: 'riddle', text: 'Count backward from 100 by 7s. Just see how far you get.' },
  { type: 'riddle', text: 'Pick an object near you. Invent a use for it nobody\u2019s thought of.' },
  { type: 'riddle', text: 'Name a word that rhymes with orange. Take your time.' },
  { type: 'riddle', text: 'Spell your name backward. Now say it out loud.' },
  { type: 'riddle', text: 'What\u2019s the largest number you can make using only today\u2019s date?' },
  { type: 'riddle', text: 'Name five things that are round \u2014 without looking around the room first.' },
  { type: 'riddle', text: 'How would you describe the color blue to someone who\u2019s never seen it?' },
  { type: 'riddle', text: 'Count the number of doors in your house without getting up.' },
  { type: 'riddle', text: 'Think of a word, then its opposite, then the opposite of that.' },
  { type: 'riddle', text: 'How many steps is it to the nearest door? Guess, then go check.' },
  { type: 'riddle', text: 'Name a smell you associate with a specific age you were.' },
  { type: 'riddle', text: 'What time is it right now on the exact opposite side of the planet?' },
  { type: 'riddle', text: 'What\u2019s the last word you said out loud? Build a new sentence backward from it.' },

  // --- perception ---
  { type: 'perception', text: 'Name three things in this room made by hands other than yours.' },
  { type: 'perception', text: 'What does your hand feel like against the surface it\u2019s resting on? Actually check.' },
  { type: 'perception', text: 'Where were you, physically, exactly one hour ago? Walk through it.' },
  { type: 'perception', text: 'What\u2019s the furthest thing you can hear right now?' },
  { type: 'perception', text: 'What\u2019s the temperature of the air on your skin right now?' },
  { type: 'perception', text: 'Notice the weight of your own body in the seat or surface beneath you.' },
  { type: 'perception', text: 'What\u2019s the quietest sound in the room you\u2019re normally not aware of?' },
  { type: 'perception', text: 'Look at your hands. When did you last really look at them?' },
  { type: 'perception', text: 'Where\u2019s the light in this room actually coming from?' },
  { type: 'perception', text: 'Name the last thing you touched before this.' },
  { type: 'perception', text: 'What\u2019s directly behind you right now, without turning around?' },
  { type: 'perception', text: 'How many colors can you count in your immediate surroundings?' },
  { type: 'perception', text: 'What does your own breathing sound like if you actually listen to it?' },
  { type: 'perception', text: 'What\u2019s the texture of the fabric nearest to your skin right now?' },

  // --- philosophical ---
  { type: 'philosophical', text: 'If today were being narrated by someone who admired you, what happens in the next ten minutes?' },
  { type: 'philosophical', text: 'Which is heavier \u2014 a decision made and lived with, or one avoided forever?' },
  { type: 'philosophical', text: 'What would you do in the next ten minutes if no one, ever, found out?' },
  { type: 'philosophical', text: 'What\u2019s one true thing about right now that won\u2019t be true in an hour?' },
  { type: 'philosophical', text: 'What are you actually feeling, underneath the story you were just telling yourself?' },
  { type: 'philosophical', text: 'If you could keep only one memory from this past year, which one \u2014 and why that one?' },
  { type: 'philosophical', text: 'What\u2019s something you believed at 16 that you no longer believe?' },
  { type: 'philosophical', text: 'Is there a version of today you\u2019ll actually want to remember? What would have to happen?' },
  { type: 'philosophical', text: 'What\u2019s the difference between being alone and being lonely \u2014 and which one is this?' },
  { type: 'philosophical', text: 'If the next hour were the only thing anyone ever knew about your character, what would it say?' },
  { type: 'philosophical', text: 'What are you avoiding right now by being anywhere but here?' },
  { type: 'philosophical', text: 'Name one thing you\u2019re certain about. Now ask yourself why.' },
  { type: 'philosophical', text: 'What would you tell yourself from exactly one year ago, if you had thirty seconds?' },
  { type: 'philosophical', text: 'Is the person you\u2019re imagining being someone you\u2019d actually want to sit and talk with?' },
  { type: 'philosophical', text: 'What\u2019s a want you have that you\u2019ve never said out loud to anyone?' },
  { type: 'philosophical', text: 'If admiration is the goal, whose admiration would actually satisfy you \u2014 and would it?' },
  { type: 'philosophical', text: 'What\u2019s something true about you that no imagined version could improve on?' },
  { type: 'philosophical', text: 'When did you last do something with no audience in mind, real or imagined?' },
  { type: 'philosophical', text: 'What does \u201cenough\u201d feel like, physically, in your body?' },
  { type: 'philosophical', text: 'If you stopped narrating your life for just a moment, what would simply... happen?' },
];

export function randomWonderPrompt() {
  return wonderPrompts[Math.floor(Math.random() * wonderPrompts.length)];
}
