// All times in seconds, taken from the voiceover's word timestamps.
export const DURATION_S = 52;

export const SCENES = {
  intro: 0, // "ओडिशा में हर कार्तिक पूर्णिमा..."
  chant: 6.6, // "आ का मा बै, पान गुआ थोइ..."
  sail: 13.4, // "यह बोइत बंदाण है— उन साधबों की याद..."
  betel: 21.55, // "आगे का हिस्सा आसान है: पान-सुपारी..."
  question: 27.8, // "पर पहले चार शब्द? आ, का, मा, बै?"
  outro: 47.2, // "आवाज़ नहीं। आपका जवाब क्या था?"
} as const;

export const CUTS = [SCENES.sail, SCENES.betel, SCENES.question];

/** chant lyric lines with the time each word is spoken */
export const CHANT_LINES: { text: string; t: number }[][] = [
  [
    { text: "आ", t: 6.63 },
    { text: "का", t: 6.88 },
    { text: "मा", t: 7.04 },
    { text: "बै,", t: 7.28 },
  ],
  [
    { text: "पान", t: 8.08 },
    { text: "गुआ", t: 8.4 },
    { text: "थोइ,", t: 8.72 },
  ],
  [
    { text: "पान", t: 9.64 },
    { text: "गुआ", t: 10.0 },
    { text: "तोर,", t: 10.32 },
  ],
  [
    { text: "मासक", t: 11.2 },
    { text: "धर्म", t: 11.68 },
    { text: "मोर।", t: 12.08 },
  ],
];

/** the four mystery syllables, when each is spoken, and the month named for it */
export const LETTERS = [
  { letter: "आ", t: 29.68, month: "आषाढ़", monthT: 38.92 },
  { letter: "का", t: 30.2, month: "कार्तिक", monthT: 39.64 },
  { letter: "मा", t: 30.68, month: "मार्गशीर्ष", monthT: 40.44 },
  { letter: "बै", t: 31.16, month: "बैशाख", monthT: 41.4 },
];

export const T = {
  kalinga: 17.16,
  bali: 17.92,
  java: 18.72,
  paan: 23.56,
  ruko: 31.95, // "रुकिए।" countdown starts
  guessEnd: 35.2,
  popular: 35.28,
  debate: 42.55,
  blur: 45.59, // "अर्थ धुंधला है..."
  awaaz: 47.2,
  answer: 48.54, // "आपका जवाब क्या था?"
  comment: 49.8,
};
