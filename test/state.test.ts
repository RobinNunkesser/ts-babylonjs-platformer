import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../src/core/state';

describe('GameStateManager', () => {
  let sm: GameStateManager;

  beforeEach(() => {
    sm = new GameStateManager();
    sm.reset();
  });

  it('starts in READY state and transitions to PLAYING', () => {
    expect(sm.currentState).toBe('READY');
    sm.start();
    expect(sm.currentState).toBe('PLAYING');
  });

  it('handles pause and resume toggle', () => {
    sm.start();
    expect(sm.currentState).toBe('PLAYING');
    sm.togglePause();
    expect(sm.currentState).toBe('PAUSED');
    sm.togglePause();
    expect(sm.currentState).toBe('PLAYING');
  });

  it('increments coin count and score on addCoin', () => {
    sm.start();
    sm.addCoin();
    expect(sm.coinCount).toBe(1);
    expect(sm.currentScore).toBe(100);
  });

  it('transitions to VICTORY and awards bonus points on win', () => {
    sm.start();
    sm.win();
    expect(sm.currentState).toBe('VICTORY');
    expect(sm.currentScore).toBeGreaterThanOrEqual(1000);
  });

  it('transitions to FALLEN on fall', () => {
    sm.start();
    sm.fall();
    expect(sm.currentState).toBe('FALLEN');
  });
});
