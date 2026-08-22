// PixelLab pickup sprite registry. Maps gacha/loot icon keys (from
// content/loot.js `icon`) to PNG URLs served from /pickups/.
//
// The gacha modal and any other UI that wants to render a pickup with
// PixelLab art looks up here first; falls back to the ASCII canvas path
// when the key has no entry.

export const PICKUP_ASSETS = {
  pickup_chest: '/pickups/pickup_chest.png',
  pickup_chest_gold: '/pickups/pickup_chest_gold.png',
  pickup_heart: '/pickups/pickup_heart.png',
  pickup_chicken: '/pickups/pickup_chicken.png',
  pickup_potion_might: '/pickups/pickup_potion_might.png',
  pickup_potion_mana: '/pickups/pickup_potion_mana.png',
  pickup_potion_hp: '/pickups/pickup_potion_hp.png',
  pickup_magnet: '/pickups/pickup_magnet.png',
  pickup_bomb: '/pickups/pickup_bomb.png',
  pickup_gold: '/pickups/pickup_gold.png',
  pickup_rune: '/pickups/pickup_rune.png',
  pickup_scroll: '/pickups/pickup_scroll.png',
  pickup_xp_red: '/pickups/pickup_xp_red.png',
  pickup_xp_green: '/pickups/pickup_xp_green.png',
  pickup_xp_blue: '/pickups/pickup_xp_blue.png',
};

export function pickupAssetUrl(iconKey) {
  return PICKUP_ASSETS[iconKey] || null;
}
