import { PLATFORMER_CONFIG } from '../config';
import { TileMap } from './tilemap';

export interface BoundingBox {
  x: number; // Mittelpunkt X
  y: number; // Mittelpunkt Y
  width: number;
  height: number;
}

export interface CollisionResult {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  hitCeilingBlock?: { col: number; row: number };
}

export class PhysicsEngine {
  private static readonly EPSILON = 0.0001;

  /**
   * 1. Horizontale Achse lösen
   */
  public static resolveX(
    box: BoundingBox,
    vx: number,
    dt: number,
    tilemap: TileMap
  ): { x: number; vx: number } {
    let newX = box.x + vx * dt;
    const halfW = box.width / 2;
    const halfH = box.height / 2;

    const left = newX - halfW;
    const right = newX + halfW;
    const bottom = box.y - halfH;
    const top = box.y + halfH;

    const minGrid = tilemap.worldToGrid(left, top);
    const maxGrid = tilemap.worldToGrid(right, bottom);

    const minCol = Math.min(minGrid.col, maxGrid.col);
    const maxCol = Math.max(minGrid.col, maxGrid.col);
    const minRow = Math.min(minGrid.row, maxGrid.row);
    const maxRow = Math.max(minGrid.row, maxGrid.row);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const tile = tilemap.getTile(c, r);
        if (!tile.isSolid) continue;

        const tileLeft = tile.worldX;
        const tileRight = tile.worldX + PLATFORMER_CONFIG.tileSize;
        const tileBottom = tile.worldY;
        const tileTop = tile.worldY + PLATFORMER_CONFIG.tileSize;

        // Vertikale Überlappung prüfen
        if (top > tileBottom + PhysicsEngine.EPSILON && bottom < tileTop - PhysicsEngine.EPSILON) {
          if (vx > 0 && right > tileLeft && left < tileLeft) {
            // Nach rechts gelaufen -> Wandkontakt links von Kachel
            newX = tileLeft - halfW - PhysicsEngine.EPSILON;
            vx = 0;
          } else if (vx < 0 && left < tileRight && right > tileRight) {
            // Nach links gelaufen -> Wandkontakt rechts von Kachel
            newX = tileRight + halfW + PhysicsEngine.EPSILON;
            vx = 0;
          }
        }
      }
    }

    return { x: newX, vx };
  }

  /**
   * 2. Vertikale Achse lösen
   */
  public static resolveY(
    box: BoundingBox,
    vy: number,
    dt: number,
    tilemap: TileMap
  ): { y: number; vy: number; onGround: boolean; hitCeilingBlock?: { col: number; row: number } } {
    let newY = box.y + vy * dt;
    const halfW = box.width / 2;
    const halfH = box.height / 2;

    const left = box.x - halfW;
    const right = box.x + halfW;
    const bottom = newY - halfH;
    const top = newY + halfH;

    const minGrid = tilemap.worldToGrid(left, top);
    const maxGrid = tilemap.worldToGrid(right, bottom);

    const minCol = Math.min(minGrid.col, maxGrid.col);
    const maxCol = Math.max(minGrid.col, maxGrid.col);
    const minRow = Math.min(minGrid.row, maxGrid.row);
    const maxRow = Math.max(minGrid.row, maxGrid.row);

    let onGround = false;
    let hitCeilingBlock: { col: number; row: number } | undefined = undefined;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const tile = tilemap.getTile(c, r);
        if (!tile.isSolid) continue;

        const tileLeft = tile.worldX;
        const tileRight = tile.worldX + PLATFORMER_CONFIG.tileSize;
        const tileBottom = tile.worldY;
        const tileTop = tile.worldY + PLATFORMER_CONFIG.tileSize;

        // Horizontale Überlappung prüfen
        if (right > tileLeft + PhysicsEngine.EPSILON && left < tileRight - PhysicsEngine.EPSILON) {
          if (vy < 0 && bottom < tileTop && top > tileTop) {
            // Fallbewegung nach unten -> Landung auf Kacheloberkante
            newY = tileTop + halfH;
            vy = 0;
            onGround = true;
          } else if (vy > 0 && top > tileBottom && bottom < tileBottom) {
            // Sprungbewegung nach oben -> Kopfkontakt an Kachelunterkante
            newY = tileBottom - halfH - PhysicsEngine.EPSILON;
            vy = 0;
            hitCeilingBlock = { col: c, row: r };
          }
        }
      }
    }

    return { y: newY, vy, onGround, hitCeilingBlock };
  }
}
