import { describe, it, expect } from 'vitest';
import { TileMap } from '../src/core/tilemap';
import { PLATFORMER_CONFIG } from '../src/config';

describe('TileMap', () => {
  const miniAscii = `
----------------
----------------
--?--S--<>------
XXXXXXXXXXXXXXXX
`.trim();

  it('parses ASCII grid dimensions correctly', () => {
    const tilemap = new TileMap(miniAscii);
    expect(tilemap.heightRows).toBe(4);
    expect(tilemap.widthCols).toBe(16);
  });

  it('transforms world coordinates to grid coordinates and vice versa', () => {
    const tilemap = new TileMap(miniAscii);
    // In our 14-row level, row 13 is worldY = 0
    // In miniAscii, heightRows = 4. row 3 is bottom (worldY = 0)
    const { worldX, worldY } = tilemap.gridToWorld(2, 13);
    expect(worldX).toBe(2 * PLATFORMER_CONFIG.tileSize);
    expect(worldY).toBe(0);

    const grid = tilemap.worldToGrid(2.5, 0.5);
    expect(grid.col).toBe(2);
    expect(grid.row).toBe(13);
  });

  it('identifies solid vs non-solid tiles', () => {
    const tilemap = new TileMap(miniAscii);
    // Row 3 in miniAscii is 'XXXXXXXXXXXXXXXX' -> GROUND
    const groundTile = tilemap.getTile(0, 3);
    expect(groundTile.type).toBe('GROUND');
    expect(groundTile.isSolid).toBe(true);

    const airTile = tilemap.getTile(0, 0);
    expect(airTile.type).toBe('AIR');
    expect(airTile.isSolid).toBe(false);
  });

  it('hits a question block and converts it to QUESTION_HIT', () => {
    const tilemap = new TileMap(miniAscii);
    // Row 2 col 2 is '?'
    const initialTile = tilemap.getTile(2, 2);
    expect(initialTile.type).toBe('QUESTION_COIN');

    const success = tilemap.hitQuestionBlock(2, 2);
    expect(success).toBe(true);

    const hitTile = tilemap.getTile(2, 2);
    expect(hitTile.type).toBe('QUESTION_HIT');

    // Second hit returns false
    const secondHit = tilemap.hitQuestionBlock(2, 2);
    expect(secondHit).toBe(false);
  });
});
