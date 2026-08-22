// Tiny pub/sub event bus — the hit-event channel (eng-review D11).
//
// damage.js emits 'hit' and 'kill'. The renderer (damage numbers) and audio
// (SFX) subscribe. Keeping this a one-way channel is what lets the simulation
// stay free of rendering and audio concerns (premise #3).

export function createEvents() {
  const listeners = new Map(); // name -> fn[]

  return {
    on(name, fn) {
      let arr = listeners.get(name);
      if (!arr) {
        arr = [];
        listeners.set(name, arr);
      }
      arr.push(fn);
    },
    emit(name, payload) {
      const arr = listeners.get(name);
      if (arr) for (let i = 0; i < arr.length; i++) arr[i](payload);
    },
  };
}
