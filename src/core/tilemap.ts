import { PLATFORMER_CONFIG } from '../config';

export type TileType =
  | 'AIR'
  | 'GROUND'
  | 'BRICK'
  | 'QUESTION_COIN'
  | 'QUESTION_HIT'
  | 'PIPE'
  | 'ENEMY'
  | 'FLAGPOLE';

export interface TileInfo {
  type: TileType;
  col: number;
  row: number;
  worldX: number;
  worldY: number;
  isSolid: boolean;
}

export class TileMap {
  public readonly widthCols: number;
  public readonly heightRows: number;
  private grid: TileType[][];
  public readonly startCol: number = 2;
  public flagpoleCol: number = 198;

  constructor(asciiData: string) {
    const lines = asciiData.trim().split(/\r?\n/).filter(line => line.length > 0);
    this.heightRows = lines.length;
    this.widthCols = Math.max(...lines.map(l => l.length));

    this.grid = [];
    for (let row = 0; row < this.heightRows; row++) {
      this.grid[row] = [];
      const line = lines[row];
      for (let col = 0; col < this.widthCols; col++) {
        const char = line[col] ?? '-';
        this.grid[row][col] = this.charToTile(char, col);
      }
    }
  }

  private charToTile(char: string, col: number): TileType {
    switch (char) {
      case 'X':
        return 'GROUND';
      case 'S':
        return 'BRICK';
      case '?':
      case 'Q':
        return 'QUESTION_COIN';
      case '<':
      case '>':
      case '[':
      case ']':
        return 'PIPE';
      case 'E':
        return 'ENEMY';
      case 'F':
      case '|':
        this.flagpoleCol = col;
        return 'FLAGPOLE';
      default:
        return 'AIR';
    }
  }

  /**
   * Rechnet eine Weltkoordinate in diskrete Kachelkoordinaten (Spalte, Zeile) um
   * In 2.5D: worldY = 0 ist Zeile 13 (unterster Boden); worldY = 13 ist Zeile 0 (Himmel).
   */
  public worldToGrid(worldX: number, worldY: number): { col: number; row: number } {
    const col = Math.floor(worldX / PLATFORMER_CONFIG.tileSize);
    const row = (PLATFORMER_CONFIG.levelHeightRows - 1) - Math.floor(worldY / PLATFORMER_CONFIG.tileSize);
    return { col, row };
  }

  public gridToWorld(col: number, row: number): { worldX: number; worldY: number } {
    const worldX = col * PLATFORMER_CONFIG.tileSize;
    const worldY = (PLATFORMER_CONFIG.levelHeightRows - 1 - row) * PLATFORMER_CONFIG.tileSize;
    return { worldX, worldY };
  }

  /**
   * O(1) Abfrage einer Kachel
   */
  public getTile(col: number, row: number): TileInfo {
    if (row < 0 || row >= this.heightRows || col < 0 || col >= this.widthCols) {
      return {
        type: 'AIR',
        col,
        row,
        worldX: col * PLATFORMER_CONFIG.tileSize,
        worldY: (PLATFORMER_CONFIG.levelHeightRows - 1 - row) * PLATFORMER_CONFIG.tileSize,
        isSolid: false,
      };
    }

    const type = this.grid[row][col];
    const isSolid = type === 'GROUND' || type === 'BRICK' || type === 'QUESTION_COIN' || type === 'QUESTION_HIT' || type === 'PIPE';
    const { worldX, worldY } = this.gridToWorld(col, row);

    return {
      type,
      col,
      row,
      worldX,
      worldY,
      isSolid,
    };
  }

  public getTileAtWorld(worldX: number, worldY: number): TileInfo {
    const { col, row } = this.worldToGrid(worldX, worldY);
    return this.getTile(col, row);
  }

  /**
   * Wandelt einen getroffenen ?-Block in QUESTION_HIT um (Münze erhalten)
   */
  public hitQuestionBlock(col: number, row: number): boolean {
    if (row >= 0 && row < this.heightRows && col >= 0 && col < this.widthCols) {
      if (this.grid[row][col] === 'QUESTION_COIN') {
        this.grid[row][col] = 'QUESTION_HIT';
        return true;
      }
    }
    return false;
  }

  public getAllTiles(): TileInfo[] {
    const tiles: TileInfo[] = [];
    for (let row = 0; row < this.heightRows; row++) {
      for (let col = 0; col < this.widthCols; col++) {
        const tile = this.getTile(col, row);
        if (tile.type !== 'AIR') {
          tiles.push(tile);
        }
      }
    }
    return tiles;
  }
}
