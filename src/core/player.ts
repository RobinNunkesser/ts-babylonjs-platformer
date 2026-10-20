import { PLATFORMER_CONFIG } from '../config';
import { PhysicsEngine, BoundingBox } from './physics';
import { TileMap } from './tilemap';

export interface PlayerInput {
  moveLeft: boolean;
  moveRight: boolean;
  jumpPressed: boolean;  // Flanke: In diesem Frame neu gedrückt
  jumpHeld: boolean;     // Status: Taste wird gehalten
}

export class Player {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public onGround: boolean = false;

  public coyoteTimer: number = 0;
  public jumpBufferTimer: number = 0;
  public isFacingRight: boolean = true;

  constructor(startX: number = PLATFORMER_CONFIG.startX, startY: number = PLATFORMER_CONFIG.startY) {
    this.x = startX;
    this.y = startY;
  }

  public get boundingBox(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: PLATFORMER_CONFIG.playerWidth,
      height: PLATFORMER_CONFIG.playerHeight,
    };
  }

  public update(
    input: PlayerInput,
    dt: number,
    tilemap: TileMap,
    onHitBlock?: (col: number, row: number) => void
  ): void {
    // 1. Timer aktualisieren
    if (this.onGround) {
      this.coyoteTimer = PLATFORMER_CONFIG.coyoteTimeSec;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    if (input.jumpPressed) {
      this.jumpBufferTimer = PLATFORMER_CONFIG.jumpBufferSec;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // 2. Horizontale Beschleunigung & Reibung
    const accelRate = this.onGround
      ? PLATFORMER_CONFIG.acceleration
      : PLATFORMER_CONFIG.acceleration * PLATFORMER_CONFIG.airControl;

    if (input.moveRight && !input.moveLeft) {
      this.vx = Math.min(PLATFORMER_CONFIG.maxRunSpeed, this.vx + accelRate * dt);
      this.isFacingRight = true;
    } else if (input.moveLeft && !input.moveRight) {
      this.vx = Math.max(-PLATFORMER_CONFIG.maxRunSpeed, this.vx - accelRate * dt);
      this.isFacingRight = false;
    } else {
      // Bremsen durch Reibung
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - PLATFORMER_CONFIG.friction * dt * PLATFORMER_CONFIG.maxRunSpeed);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + PLATFORMER_CONFIG.friction * dt * PLATFORMER_CONFIG.maxRunSpeed);
      }
    }

    // 3. Sprung-Ausführung mit Coyote Time & Buffer
    const canJump = this.onGround || this.coyoteTimer > 0;
    if (canJump && this.jumpBufferTimer > 0) {
      this.vy = PLATFORMER_CONFIG.jumpForce;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.onGround = false;
    }

    // 4. Variable Sprunghöhe: Loslassen kappt Aufwärtsimpuls
    if (!input.jumpHeld && this.vy > 0) {
      this.vy *= PLATFORMER_CONFIG.variableJumpCut;
    }

    // 5. Gravitation anwenden
    this.vy -= PLATFORMER_CONFIG.gravity * dt;

    // 6. Axis-Separated AABB Kollisionskorrektur
    // Schritt A: Horizontale Achse
    const resX = PhysicsEngine.resolveX(this.boundingBox, this.vx, dt, tilemap);
    this.x = resX.x;
    this.vx = resX.vx;

    // Schritt B: Vertikale Achse
    const resY = PhysicsEngine.resolveY(this.boundingBox, this.vy, dt, tilemap);
    this.y = resY.y;
    this.vy = resY.vy;
    this.onGround = resY.onGround;

    // Block-Kontakt von unten (Kopfstöße gegen ? oder Bricks)
    if (resY.hitCeilingBlock && onHitBlock) {
      onHitBlock(resY.hitCeilingBlock.col, resY.hitCeilingBlock.row);
    }
  }

  public reset(startX: number = PLATFORMER_CONFIG.startX, startY: number = PLATFORMER_CONFIG.startY): void {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isFacingRight = true;
  }
}
