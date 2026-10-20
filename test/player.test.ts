import { describe, it, expect } from 'vitest';
import { Player } from '../src/core/player';
import { TileMap } from '../src/core/tilemap';
import { PLATFORMER_CONFIG } from '../src/config';

describe('Player', () => {
  const floorLevel = `
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
----------------
XXXXXXXXXXXXXXXX
`.trim();

  const tilemap = new TileMap(floorLevel);

  it('accelerates to the right when moveRight is pressed', () => {
    const player = new Player(2.0, 1.45);
    player.onGround = true;

    player.update({ moveLeft: false, moveRight: true, jumpPressed: false, jumpHeld: false }, 0.05, tilemap);
    expect(player.vx).toBeGreaterThan(0);
    expect(player.isFacingRight).toBe(true);
  });

  it('triggers jump and grants upward vertical velocity', () => {
    const player = new Player(2.0, 1.45);
    player.onGround = true;

    player.update({ moveLeft: false, moveRight: false, jumpPressed: true, jumpHeld: true }, 0.016, tilemap);
    expect(player.vy).toBeGreaterThan(0);
    expect(player.onGround).toBe(false);
  });

  it('supports coyote time shortly after leaving edge', () => {
    const player = new Player(2.0, 1.45);
    player.onGround = true;

    // First frame on ground sets coyoteTimer
    player.update({ moveLeft: false, moveRight: false, jumpPressed: false, jumpHeld: false }, 0.016, tilemap);
    expect(player.coyoteTimer).toBeCloseTo(PLATFORMER_CONFIG.coyoteTimeSec, 2);

    // Player falls off edge (onGround = false)
    player.onGround = false;
    player.coyoteTimer = 0.08; // Still within coyote time (0.12s)

    // Jump pressed in mid-air within coyote window
    player.update({ moveLeft: false, moveRight: false, jumpPressed: true, jumpHeld: true }, 0.016, tilemap);
    expect(player.vy).toBeGreaterThan(0);
  });
});
