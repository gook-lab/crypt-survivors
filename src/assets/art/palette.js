// Gothic dark-fantasy palette — single source of truth for all sprites.
// Indexed by a single character so sprites can be authored as ASCII art.
// Keep this list tight (≤32 colors) so the whole pack feels cohesive.
window.PALETTE = {
  // transparency
  '.': null, ' ': null,

  // void / shadow
  '0': '#07060c', // pitch shadow
  '1': '#14101e', // deep night
  '2': '#241c33', // shadow purple
  '3': '#3d3050', // stone shadow
  '4': '#5a4a6d', // stone mid
  '5': '#7c6d8d', // stone light
  '6': '#b4a5b8', // bone / cool highlight
  '7': '#ece2c8', // parchment
  'P': '#ffffff', // bright spec (rare)

  // gold / brass
  '8': '#8a5a18', // gold dark
  '9': '#d4a04a', // gold mid
  'Y': '#f0d27a', // gold bright

  // leather / wood
  'a': '#3a2418', // leather dark
  'b': '#6a3c20', // leather mid
  'c': '#a86838', // leather light
  'C': '#d8b27a', // leather bright (highlight)

  // fire / ember
  'd': '#c64628', // ember mid
  'e': '#f08a2a', // ember bright
  'f': '#fac860', // flame highlight

  // blood
  'r': '#6a1820', // blood dark
  'R': '#c8332a', // blood red

  // vile green (ghoul flesh)
  'g': '#24502a', // vile dark
  'G': '#4a8a3a', // vile mid
  'h': '#88b85a', // vile light
  'H': '#b6e472', // vile bright (rim highlight)

  // misc
  '?': '#9a2a36', // banner red (hero-icon ribbon)

  // steel / mana blue
  'k': '#1f3d68', // steel dark
  'i': '#3a78c8', // steel mid
  'I': '#6fb4dc', // steel light / mana
  'W': '#bfe6f0', // ice highlight

  // arcane purple
  'p': '#3a1a55', // arcane dark
  'm': '#6e3a8a', // arcane mid
  'M': '#b574d8', // arcane light

  // gem cyan (XP)
  'n': '#1c6a7e', // gem dark
  'N': '#49d0e0', // gem cyan
  'q': '#a8f0f4', // gem highlight
};
