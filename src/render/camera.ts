import { Scene, Vector3, TargetCamera } from '@babylonjs/core';
import { PLATFORMER_CONFIG } from '../config';

export class FollowCamera25D {
  public camera: TargetCamera;
  private targetX: number = PLATFORMER_CONFIG.startX;
  private targetY: number = PLATFORMER_CONFIG.startY;

  constructor(scene: Scene) {
    // Frontale Kamera bei Z = -17.5, blickt auf Z = 0
    this.camera = new TargetCamera(
      'camera25d',
      new Vector3(PLATFORMER_CONFIG.startX, PLATFORMER_CONFIG.startY + PLATFORMER_CONFIG.cameraHeightOffset, PLATFORMER_CONFIG.cameraZ),
      scene
    );
    this.camera.setTarget(new Vector3(PLATFORMER_CONFIG.startX, PLATFORMER_CONFIG.startY + PLATFORMER_CONFIG.cameraHeightOffset, 0));
    this.camera.fov = 0.85; // Ausgewogenes Sichtfeld
  }

  public update(playerX: number, playerY: number, dt: number): void {
    // Sanfte Interpolation auf X
    const diffX = playerX - this.targetX;
    if (Math.abs(diffX) > PLATFORMER_CONFIG.cameraDeadzoneX) {
      const dir = Math.sign(diffX);
      this.targetX += (diffX - dir * PLATFORMER_CONFIG.cameraDeadzoneX) * PLATFORMER_CONFIG.cameraLerpSpeed * dt;
    }

    // Vertikaler Blickpunkt (sanft folgen, aber nicht hektisch)
    const idealY = Math.max(PLATFORMER_CONFIG.cameraHeightOffset, playerY * 0.4 + PLATFORMER_CONFIG.cameraHeightOffset);
    this.targetY += (idealY - this.targetY) * PLATFORMER_CONFIG.cameraLerpSpeed * 0.5 * dt;

    this.camera.position.x = this.targetX;
    this.camera.position.y = this.targetY;
    this.camera.setTarget(new Vector3(this.targetX, this.targetY, 0));
  }

  public reset(startX: number, startY: number): void {
    this.targetX = startX;
    this.targetY = startY + PLATFORMER_CONFIG.cameraHeightOffset;
    this.camera.position.set(this.targetX, this.targetY, PLATFORMER_CONFIG.cameraZ);
    this.camera.setTarget(new Vector3(this.targetX, this.targetY, 0));
  }
}
