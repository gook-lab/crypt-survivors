// Passive icons added late (aura / endure) — share7 doesn't ship sprites for
// them, so we define minimal 16×16 ASCII art so the level-up cards render an
// icon instead of a blank canvas.

(function () {
  if (!window.SPRITES || !window.PALETTE) return;

  function pad(arr, n) {
    return arr.map((r) => {
      while (r.length < n) r += '.';
      return r.slice(0, n);
    });
  }

  // 범위 (aura) — concentric rings spreading outward, a "skill range" emblem
  const AURA = pad([
    '................',
    '......1111......',
    '....11mmmm11....',
    '...1mMMMMMM m1..',
    '..1mMqqqqMM m1..',
    '..1MqqPPqqMMm1..',
    '..1MqPwwPqMMm1..',
    '..1MqPwwPqMMm1..',
    '..1MqqPPqqMMm1..',
    '..1mMqqqqMM m1..',
    '...1mMMMMMMm1...',
    '....11mmmm11....',
    '......1111......',
    '................',
    '................',
    '................',
  ], 16);

  // 지속 (endure) — an hourglass: sand falling = "skill duration"
  const ENDURE = pad([
    '................',
    '..1111111111....',
    '..1Y8888888Y1...',
    '..18YYYYYYY81...',
    '...18YYYYY81....',
    '....18YYY81.....',
    '.....18Y81......',
    '......181.......',
    '......181.......',
    '.....18Y81......',
    '....18YYY81.....',
    '...18YYYYY81....',
    '..18YYYYYYY81...',
    '..1Y8888888Y1...',
    '..1111111111....',
    '................',
  ], 16);

  Object.assign(window.SPRITES, {
    icon_aura: [AURA],
    icon_endure: [ENDURE],
  });
})();
