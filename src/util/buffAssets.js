// PixelLab buff halo PNG registry. Maps logical buff keys (set on
// aura_buff weapon defs as `assetKey`) to 5-frame animation cycles
// rendered as rotating halos under the player when the buff is active.
//
// Schema mirrors sigAssets/weaponAssets — string URL or
// { frames: [...], fps } object. drawBuffHalo loads via buffAssetUrl
// and overlays the PNG on top of the Graphics circle.
//
// 64x64 PNGs in public/buffs/ — Vite serves /buffs/*.

export const BUFF_ASSETS = {
  buff_arcane_field: {
    frames: [
      '/buffs/buff_arcane_field_0.png',
      '/buffs/buff_arcane_field_1.png',
      '/buffs/buff_arcane_field_2.png',
      '/buffs/buff_arcane_field_3.png',
      '/buffs/buff_arcane_field_4.png',
    ],
    fps: 10,
  },
  buff_warcry_pulse: {
    frames: [
      '/buffs/buff_warcry_pulse_0.png',
      '/buffs/buff_warcry_pulse_1.png',
      '/buffs/buff_warcry_pulse_2.png',
      '/buffs/buff_warcry_pulse_3.png',
      '/buffs/buff_warcry_pulse_4.png',
    ],
    fps: 12,
  },
  buff_wrath_focus: {
    frames: [
      '/buffs/buff_wrath_focus_0.png',
      '/buffs/buff_wrath_focus_1.png',
      '/buffs/buff_wrath_focus_2.png',
      '/buffs/buff_wrath_focus_3.png',
      '/buffs/buff_wrath_focus_4.png',
    ],
    fps: 10,
  },
  buff_holy_blessing: {
    frames: [
      '/buffs/buff_holy_blessing_0.png',
      '/buffs/buff_holy_blessing_1.png',
      '/buffs/buff_holy_blessing_2.png',
      '/buffs/buff_holy_blessing_3.png',
      '/buffs/buff_holy_blessing_4.png',
    ],
    fps: 12,
  },
  buff_garlic_aura: {
    frames: [
      '/buffs/buff_garlic_aura_0.png',
      '/buffs/buff_garlic_aura_1.png',
      '/buffs/buff_garlic_aura_2.png',
      '/buffs/buff_garlic_aura_3.png',
      '/buffs/buff_garlic_aura_4.png',
    ],
    fps: 10,
  },
};

export function buffAssetUrl(key, elapsed = 0) {
  const v = BUFF_ASSETS[key];
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (v.frames && v.frames.length) {
    const idx = Math.floor(elapsed * (v.fps || 10)) % v.frames.length;
    return v.frames[idx];
  }
  return null;
}
