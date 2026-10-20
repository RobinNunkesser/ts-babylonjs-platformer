export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'FALLEN' | 'VICTORY';

export class GameStateManager {
  private state: GameState = 'READY';
  private score: number = 0;
  private coins: number = 0;
  private highscore: number = 0;

  constructor() {
    this.loadHighscore();
  }

  public get currentState(): GameState {
    return this.state;
  }

  public get currentScore(): number {
    return this.score;
  }

  public get coinCount(): number {
    return this.coins;
  }

  public get bestScore(): number {
    return this.highscore;
  }

  public start(): void {
    if (this.state === 'READY' || this.state === 'FALLEN' || this.state === 'VICTORY') {
      this.state = 'PLAYING';
    }
  }

  public pause(): void {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
    }
  }

  public resume(): void {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
    }
  }

  public togglePause(): void {
    if (this.state === 'PLAYING') {
      this.pause();
    } else if (this.state === 'PAUSED') {
      this.resume();
    }
  }

  public fall(): void {
    if (this.state === 'PLAYING') {
      this.state = 'FALLEN';
      this.saveHighscore();
    }
  }

  public win(): void {
    if (this.state === 'PLAYING') {
      this.state = 'VICTORY';
      this.score += 1000;
      this.saveHighscore();
    }
  }

  public addCoin(): void {
    this.coins += 1;
    this.score += 100;
    if (this.score > this.highscore) {
      this.highscore = this.score;
    }
  }

  public addProgress(distancePoints: number): void {
    if (this.state === 'PLAYING') {
      this.score = Math.max(this.score, Math.floor(distancePoints));
      if (this.score > this.highscore) {
        this.highscore = this.score;
      }
    }
  }

  public reset(): void {
    this.state = 'READY';
    this.score = 0;
    this.coins = 0;
  }

  private loadHighscore(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('ts_platformer_highscore');
        if (saved) {
          this.highscore = parseInt(saved, 10) || 0;
        }
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }

  private saveHighscore(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ts_platformer_highscore', this.highscore.toString());
      }
    } catch {
      // Ignore
    }
  }
}
