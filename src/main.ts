import { Engine, Scene, Color4 } from '@babylonjs/core';
import { PLATFORMER_CONFIG } from './config';
import { TileMap } from './core/tilemap';
import { Player, PlayerInput } from './core/player';
import { GameStateManager } from './core/state';
import { RenderWorld } from './render/world';
import { FollowCamera25D } from './render/camera';
import { RetroAudio } from './render/audio';
import marioLevelAscii from '../levels/mario-1-1.txt?raw';

class PlatformerApp {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;

  private tilemap: TileMap;
  private player: Player;
  private stateManager: GameStateManager;
  private renderWorld: RenderWorld;
  private camera25D: FollowCamera25D;
  private audio: RetroAudio;

  // Eingabestatus
  private inputState: PlayerInput = {
    moveLeft: false,
    moveRight: false,
    jumpPressed: false,
    jumpHeld: false,
  };

  // UI Elemente
  private hudScore!: HTMLElement;
  private hudCoins!: HTMLElement;
  private hudHighscore!: HTMLElement;
  private overlayStart!: HTMLElement;
  private overlayPause!: HTMLElement;
  private overlayGameOver!: HTMLElement;
  private overlayVictory!: HTMLElement;
  private gameoverScore!: HTMLElement;
  private gameoverCoins!: HTMLElement;
  private victoryScore!: HTMLElement;
  private victoryCoins!: HTMLElement;

  constructor() {
    this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.38, 0.60, 0.98, 1.0); // Nostalgic Mario Sky Blue

    // Kerninstanzen initialisieren
    this.tilemap = new TileMap(marioLevelAscii);
    this.player = new Player(PLATFORMER_CONFIG.startX, PLATFORMER_CONFIG.startY);
    this.stateManager = new GameStateManager();
    this.audio = new RetroAudio();

    this.renderWorld = new RenderWorld(this.scene);
    this.camera25D = new FollowCamera25D(this.scene);

    this.renderWorld.buildLevel(this.tilemap);

    this.bindUI();
    this.bindKeyboard();
    this.bindTouch();
    this.bindResize();

    this.updateHUD();
    this.startRenderLoop();
  }

  private bindUI(): void {
    this.hudScore = document.getElementById('hud-score')!;
    this.hudCoins = document.getElementById('hud-coins')!;
    this.hudHighscore = document.getElementById('hud-highscore')!;

    this.overlayStart = document.getElementById('overlay-start')!;
    this.overlayPause = document.getElementById('overlay-pause')!;
    this.overlayGameOver = document.getElementById('overlay-gameover')!;
    this.overlayVictory = document.getElementById('overlay-victory')!;

    this.gameoverScore = document.getElementById('gameover-score')!;
    this.gameoverCoins = document.getElementById('gameover-coins')!;
    this.victoryScore = document.getElementById('victory-score')!;
    this.victoryCoins = document.getElementById('victory-coins')!;

    document.getElementById('btn-start')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePause());
    document.getElementById('btn-restart')?.addEventListener('click', () => this.restartGame());
    document.getElementById('btn-victory-restart')?.addEventListener('click', () => this.restartGame());
  }

  private bindKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.inputState.moveLeft = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.inputState.moveRight = true;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!this.inputState.jumpHeld) {
          this.inputState.jumpPressed = true;
          if (this.stateManager.currentState === 'PLAYING') {
            this.audio.playJump();
          }
        }
        this.inputState.jumpHeld = true;
      }
      if (e.code === 'KeyP') {
        this.togglePause();
      }
      if (e.code === 'KeyR') {
        this.restartGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        this.inputState.moveLeft = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        this.inputState.moveRight = false;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.inputState.jumpHeld = false;
      }
    });
  }

  private bindTouch(): void {
    const leftBtn = document.getElementById('touch-left');
    const rightBtn = document.getElementById('touch-right');
    const jumpBtn = document.getElementById('touch-jump');

    const handleTouch = (el: HTMLElement | null, onStart: () => void, onEnd: () => void) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onStart();
      });
      el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        onEnd();
      });
      el.addEventListener('pointercancel', () => onEnd());
      el.addEventListener('pointerleave', () => onEnd());
    };

    handleTouch(
      leftBtn,
      () => { this.inputState.moveLeft = true; },
      () => { this.inputState.moveLeft = false; }
    );

    handleTouch(
      rightBtn,
      () => { this.inputState.moveRight = true; },
      () => { this.inputState.moveRight = false; }
    );

    handleTouch(
      jumpBtn,
      () => {
        this.inputState.jumpPressed = true;
        this.inputState.jumpHeld = true;
        if (this.stateManager.currentState === 'PLAYING') {
          this.audio.playJump();
        }
      },
      () => {
        this.inputState.jumpHeld = false;
      }
    );
  }

  private bindResize(): void {
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private startGame(): void {
    this.overlayStart.classList.remove('active');
    this.overlayStart.classList.add('hidden');
    this.stateManager.start();
  }

  private togglePause(): void {
    this.stateManager.togglePause();
    if (this.stateManager.currentState === 'PAUSED') {
      this.overlayPause.classList.remove('hidden');
      this.overlayPause.classList.add('active');
    } else if (this.stateManager.currentState === 'PLAYING') {
      this.overlayPause.classList.remove('active');
      this.overlayPause.classList.add('hidden');
    }
  }

  private restartGame(): void {
    this.overlayGameOver.classList.remove('active');
    this.overlayGameOver.classList.add('hidden');
    this.overlayVictory.classList.remove('active');
    this.overlayVictory.classList.add('hidden');
    this.overlayPause.classList.remove('active');
    this.overlayPause.classList.add('hidden');

    this.player.reset(PLATFORMER_CONFIG.startX, PLATFORMER_CONFIG.startY);
    this.camera25D.reset(PLATFORMER_CONFIG.startX, PLATFORMER_CONFIG.startY);
    this.stateManager.reset();
    this.stateManager.start();
    this.updateHUD();
  }

  private updateHUD(): void {
    const pad = (num: number, digits: number) => num.toString().padStart(digits, '0');
    this.hudScore.textContent = pad(this.stateManager.currentScore, 6);
    this.hudCoins.textContent = `×${pad(this.stateManager.coinCount, 2)}`;
    this.hudHighscore.textContent = pad(this.stateManager.bestScore, 6);
  }

  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      const rawDt = this.engine.getDeltaTime() / 1000.0;
      const dt = Math.min(rawDt, 0.05); // Frame-Drop Begrenzung

      if (this.stateManager.currentState === 'PLAYING') {
        // Spielerbewegung & Physik
        this.player.update(this.inputState, dt, this.tilemap, (col, row) => {
          if (this.tilemap.hitQuestionBlock(col, row)) {
            this.stateManager.addCoin();
            this.audio.playCoin();
            this.renderWorld.animateBlockHit(col, row);
            this.updateHUD();
          }
        });

        // Fortschrittspunkte sammeln
        const distanceScore = Math.floor(this.player.x * 10);
        this.stateManager.addProgress(distanceScore);

        // Siegbedingung: Fahnenmast erreicht
        if (this.player.x >= (this.tilemap.flagpoleCol - 0.5) * PLATFORMER_CONFIG.tileSize) {
          this.stateManager.win();
          this.audio.playWin();
          this.victoryScore.textContent = this.stateManager.currentScore.toString();
          this.victoryCoins.textContent = this.stateManager.coinCount.toString();
          this.overlayVictory.classList.remove('hidden');
          this.overlayVictory.classList.add('active');
        }

        // Absturz in den Abgrund
        if (this.player.y < PLATFORMER_CONFIG.deathY) {
          this.stateManager.fall();
          this.audio.playFall();
          this.gameoverScore.textContent = this.stateManager.currentScore.toString();
          this.gameoverCoins.textContent = this.stateManager.coinCount.toString();
          this.overlayGameOver.classList.remove('hidden');
          this.overlayGameOver.classList.add('active');
        }

        // Kamera & 3D Meshes nachführen
        this.camera25D.update(this.player.x, this.player.y, dt);
        this.renderWorld.updatePlayerMesh(this.player.x, this.player.y, this.player.isFacingRight, this.player.vy);
        this.updateHUD();
      }

      // Sprungflanke nach dem Frame zurücksetzen
      this.inputState.jumpPressed = false;

      this.scene.render();
    });
  }
}

// App starten
new PlatformerApp();
