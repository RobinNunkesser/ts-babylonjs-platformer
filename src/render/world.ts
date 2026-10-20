import {
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  GlowLayer,
  InstancedMesh,
  Mesh,
  PointLight,
  DirectionalLight,
  ShadowGenerator,
} from '@babylonjs/core';
import { TileMap } from '../core/tilemap';
import { PLATFORMER_CONFIG } from '../config';

export class RenderWorld {
  public scene: Scene;
  public playerMesh!: Mesh;
  public glowLayer!: GlowLayer;
  public shadowGenerator!: ShadowGenerator;

  private questionBlockMeshes: Map<string, InstancedMesh> = new Map();
  private hitMaterial!: StandardMaterial;

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupLighting();
    this.setupPlayerMesh();
  }

  private setupLighting(): void {
    // 1. Umgebungslicht
    this.scene.ambientColor = new Color3(0.2, 0.25, 0.35);

    // 2. Gerichtetes Hauptlicht (Sonnenlicht / Seitenschatten)
    const dirLight = new DirectionalLight('dirLight', new Vector3(0.4, -0.8, 0.5), this.scene);
    dirLight.intensity = 1.2;
    dirLight.diffuse = new Color3(1.0, 0.95, 0.88);

    // 3. Weiches Füll-Licht
    const fillLight = new PointLight('fillLight', new Vector3(0, 10, -10), this.scene);
    fillLight.intensity = 0.5;
    fillLight.diffuse = new Color3(0.6, 0.8, 1.0);

    // 4. Glow-Effekt für Neon-/Fragezeichenblöcke
    this.glowLayer = new GlowLayer('glow', this.scene);
    this.glowLayer.intensity = 0.6;
  }

  private setupPlayerMesh(): void {
    // Spieler als stilisierter 3D-Gleiter / Charakter-Quader
    this.playerMesh = MeshBuilder.CreateBox(
      'player',
      {
        width: PLATFORMER_CONFIG.playerWidth,
        height: PLATFORMER_CONFIG.playerHeight,
        depth: 0.9,
      },
      this.scene
    );

    const playerMat = new StandardMaterial('playerMat', this.scene);
    playerMat.diffuseColor = new Color3(0.95, 0.2, 0.25); // Vibrant Mario-Red
    playerMat.emissiveColor = new Color3(0.3, 0.05, 0.05);
    playerMat.specularColor = new Color3(1, 1, 1);
    this.playerMesh.material = playerMat;
    this.playerMesh.position = new Vector3(PLATFORMER_CONFIG.startX, PLATFORMER_CONFIG.startY, 0);

    // Augen / Visor als Richtungsindikator
    const visor = MeshBuilder.CreateBox('visor', { width: 0.5, height: 0.2, depth: 0.2 }, this.scene);
    const visorMat = new StandardMaterial('visorMat', this.scene);
    visorMat.diffuseColor = new Color3(1, 1, 1);
    visorMat.emissiveColor = new Color3(0.8, 0.9, 1.0);
    visor.material = visorMat;
    visor.position = new Vector3(0, 0.2, 0.45);
    visor.parent = this.playerMesh;
  }

  public buildLevel(tilemap: TileMap): void {
    const ts = PLATFORMER_CONFIG.tileSize;

    // --- Materialien erstellen ---
    const groundMat = new StandardMaterial('groundMat', this.scene);
    groundMat.diffuseColor = new Color3(0.85, 0.45, 0.2); // Warm Terracotta Ground
    groundMat.specularColor = new Color3(0.1, 0.1, 0.1);

    const brickMat = new StandardMaterial('brickMat', this.scene);
    brickMat.diffuseColor = new Color3(0.75, 0.25, 0.15); // Dark Brick
    brickMat.specularColor = new Color3(0.2, 0.2, 0.2);

    const questionMat = new StandardMaterial('questionMat', this.scene);
    questionMat.diffuseColor = new Color3(1.0, 0.75, 0.1); // Glowing Gold Coin-Block
    questionMat.emissiveColor = new Color3(0.4, 0.3, 0.05);
    questionMat.specularColor = new Color3(1, 1, 0.5);

    this.hitMaterial = new StandardMaterial('hitMat', this.scene);
    this.hitMaterial.diffuseColor = new Color3(0.45, 0.48, 0.55); // Spent Block Steel-Grey
    this.hitMaterial.specularColor = new Color3(0.1, 0.1, 0.1);

    const pipeMat = new StandardMaterial('pipeMat', this.scene);
    pipeMat.diffuseColor = new Color3(0.1, 0.75, 0.35); // Emerald Green Pipe
    pipeMat.specularColor = new Color3(0.4, 0.8, 0.4);

    const flagMat = new StandardMaterial('flagMat', this.scene);
    flagMat.diffuseColor = new Color3(0.9, 0.85, 0.1); // Gold Flagpole
    flagMat.emissiveColor = new Color3(0.3, 0.25, 0.0);

    // --- Basis-Meshes für Instancing ---
    const baseGround = MeshBuilder.CreateBox('baseGround', { width: ts, height: ts, depth: ts }, this.scene);
    baseGround.material = groundMat;
    baseGround.isVisible = false;

    const baseBrick = MeshBuilder.CreateBox('baseBrick', { width: ts, height: ts, depth: ts }, this.scene);
    baseBrick.material = brickMat;
    baseBrick.isVisible = false;

    const baseQuestion = MeshBuilder.CreateBox('baseQuestion', { width: ts, height: ts, depth: ts }, this.scene);
    baseQuestion.material = questionMat;
    baseQuestion.isVisible = false;

    const basePipe = MeshBuilder.CreateBox('basePipe', { width: ts, height: ts, depth: ts * 1.2 }, this.scene);
    basePipe.material = pipeMat;
    basePipe.isVisible = false;

    const baseFlag = MeshBuilder.CreateCylinder('baseFlag', { height: ts, diameter: ts * 0.2 }, this.scene);
    baseFlag.material = flagMat;
    baseFlag.isVisible = false;

    // --- Kacheln instanziieren ---
    const tiles = tilemap.getAllTiles();
    let instanceCount = 0;

    for (const t of tiles) {
      const posX = t.worldX + ts / 2;
      const posY = t.worldY + ts / 2;
      const posZ = 0;

      switch (t.type) {
        case 'GROUND': {
          const inst = baseGround.createInstance(`ground_${instanceCount++}`);
          inst.position.set(posX, posY, posZ);
          break;
        }
        case 'BRICK': {
          const inst = baseBrick.createInstance(`brick_${instanceCount++}`);
          inst.position.set(posX, posY, posZ);
          break;
        }
        case 'QUESTION_COIN': {
          const inst = baseQuestion.createInstance(`question_${t.col}_${t.row}`);
          inst.position.set(posX, posY, posZ);
          this.questionBlockMeshes.set(`${t.col}_${t.row}`, inst);
          break;
        }
        case 'PIPE': {
          const inst = basePipe.createInstance(`pipe_${instanceCount++}`);
          inst.position.set(posX, posY, posZ);
          break;
        }
        case 'FLAGPOLE': {
          const inst = baseFlag.createInstance(`flag_${instanceCount++}`);
          inst.position.set(posX, posY, posZ);
          break;
        }
      }
    }

    // --- 3D Parallaxe-Hintergrund erstellen ---
    this.createParallaxBackground(tilemap.widthCols * ts);
  }

  private createParallaxBackground(levelLength: number): void {
    // 1. Hintergrund-Berge bei Z = +16 (bewegen sich durch 3D-Perspektive mit ~50% Parallaxe)
    const mountainMat = new StandardMaterial('mountainMat', this.scene);
    mountainMat.diffuseColor = new Color3(0.2, 0.35, 0.55); // Indigo/Blue Mountains
    mountainMat.specularColor = new Color3(0, 0, 0);

    for (let x = 0; x < levelLength + 50; x += 18) {
      const cone = MeshBuilder.CreateCylinder(
        `mountain_${x}`,
        {
          height: 12 + (x % 5),
          diameterTop: 0,
          diameterBottom: 16 + (x % 7),
          tessellation: 4, // Stylized low-poly pyramid mountain
        },
        this.scene
      );
      cone.material = mountainMat;
      cone.position = new Vector3(x, 4, 16);
      cone.rotation.y = Math.PI / 4;
    }

    // 2. Wolken bei Z = +26 (~38% Parallaxe)
    const cloudMat = new StandardMaterial('cloudMat', this.scene);
    cloudMat.diffuseColor = new Color3(0.9, 0.95, 1.0);
    cloudMat.specularColor = new Color3(0, 0, 0);

    for (let x = 5; x < levelLength + 40; x += 22) {
      const cloud = MeshBuilder.CreateSphere(`cloud_${x}`, { diameterX: 6, diameterY: 2.2, diameterZ: 2.5 }, this.scene);
      cloud.material = cloudMat;
      cloud.position = new Vector3(x, 11 + (x % 3), 26);
    }
  }

  public animateBlockHit(col: number, row: number): void {
    const key = `${col}_${row}`;
    const mesh = this.questionBlockMeshes.get(key);
    if (!mesh) return;

    // Kachel springt kurz nach oben und färbt sich inaktiv
    const originalY = mesh.position.y;
    mesh.position.y += 0.35;
    setTimeout(() => {
      mesh.position.y = originalY;
    }, 90);
  }

  public updatePlayerMesh(x: number, y: number, isFacingRight: boolean, vy: number): void {
    this.playerMesh.position.x = x;
    this.playerMesh.position.y = y;

    // Leichtes Neigen beim Sprung (Juice)
    const targetRotZ = isFacingRight ? -0.05 : 0.05;
    this.playerMesh.rotation.z = vy > 1.0 ? targetRotZ * 2 : 0;
    this.playerMesh.rotation.y = isFacingRight ? 0 : Math.PI;
  }
}
