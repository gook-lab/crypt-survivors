// PixelLab Wang tileset registry.
//
// Each PNG is 64x64 with a 4x4 grid of 16 sub-tiles (16x16 each), generated
// by PixelLab's topdown Wang tileset endpoint. The renderer splits the PNG
// into 16 sub-textures at first use and floor cells are picked by hashing
// (cx,cy) → sub-tile index, mirroring the existing ASCII tile bag pattern
// (a stable picked tile per cell regardless of camera).
//
// Map data references one of these keys via `pngTileset` (content/maps.js).

export const TILESETS = {
  dungeon: { url: '/tilesets/dungeon.png' }, // Ch.1 고대 던전
  forest: { url: '/tilesets/forest.png' }, // Ch.2 저주받은 숲
  swamp: { url: '/tilesets/swamp.png' }, // Ch.3 독무 늪지
  lava: { url: '/tilesets/lava.png' }, // Ch.4 용암 분지
  ice: { url: '/tilesets/ice.png' }, // Ch.5 서리 동굴
  void: { url: '/tilesets/void.png' }, // Ch.6 공허의 균열
};

// Each PNG is GRID×GRID sub-tiles (16x16 each), packed into a TILE_SIZE
// wide / TILE_SIZE tall sheet. PixelLab Wang sheets are 4x4 of 16x16 = 64x64.
export const TILESET_GRID = 4;
export const TILESET_TILE_PX = 16;
