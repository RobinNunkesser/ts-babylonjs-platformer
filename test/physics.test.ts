import { describe, it, expect } from 'vitest';
import { PhysicsEngine } from '../src/core/physics';
import { TileMap } from '../src/core/tilemap';

describe('PhysicsEngine', () => {
  // 14 lines matching standard configuration
  const testLevel = `
----------------
----------------
----------------
----------------
----------------
----------------
----------------
----------------
----------------
----------------
----------------
----------------
----X-----------
XXXXXXXXXXXXXXXX
`.trim();

  const tilemap = new TileMap(testLevel);

  it('stops horizontal movement when colliding with a solid block', () => {
    // Block at row 12, col 4: worldX = 4, worldY = 1
    // Player moving right towards x = 4
    const box = { x: 3.2, y: 1.5, width: 0.8, height: 0.9 };
    const vx = 5.0;
    const dt = 0.1;

    const res = PhysicsEngine.resolveX(box, vx, dt, tilemap);
    // Player should be placed to the left of the block (tileLeft = 4.0 - halfW = 0.4 -> ~3.6)
    expect(res.vx).toBe(0);
    expect(res.x).toBeLessThan(4.0);
  });

  it('lands on solid ground and sets onGround to true', () => {
    // Floor is at row 13 (worldY = 0, top of floor = 1.0)
    // Player falling from y = 1.8 down with vy = -10
    const box = { x: 2.0, y: 1.8, width: 0.8, height: 0.9 };
    const vy = -10.0;
    const dt = 0.1;

    const res = PhysicsEngine.resolveY(box, vy, dt, tilemap);
    expect(res.onGround).toBe(true);
    expect(res.vy).toBe(0);
    // Player center should be at floorTop (1.0) + halfHeight (0.45) = 1.45
    expect(res.y).toBeCloseTo(1.45, 2);
  });
});
