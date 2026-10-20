# 05 - Gameplay-Parameter & Tuning

Alle physikalischen und visuellen Stellschrauben müssen in eine zentrale Konfiguration (`config.ts` bzw. `config.gd`) ausgelagert werden.

---

## 📐 Mathematische Auslegung der Sprunghöhe

Im VGLC-Level *Super Mario Bros.* World 1-1 besitzen die Hindernisse folgende Höhen:
- **Röhre 1 (Spalte 28):** 2 Blöcke hoch
- **Röhre 2 (Spalte 38):** 3 Blöcke hoch
- **Röhre 3 & 4 (Spalte 46 & 57):** 4 Blöcke hoch

Aus der physikalischen Gleichung für den senkrechten Wurf ergibt sich die maximale Sprunghöhe $h_{\max}$:
$$h_{\max} = \frac{v_0^2}{2 \cdot g}$$

Damit der Spieler eine 4-Block-Röhre mit Sicherheitsabstand überwinden kann, muss $h_{\max} \ge 4.5\text{ Blöcke}$ betragen!

---

## Parametermatrix

| Parameter | Empfohlener Wert | Einheit | Beschreibung |
|---|---|---|---|
| `TILE_SIZE` | `1.0` (3D) / `48` (2D) | Units / px | Grundmaß einer Kachel |
| `GRAVITY` | `28.0` (3D) / `1350.0` (2D) | Units/s² | Nach unten gerichtete Schwerkraft |
| `MAX_RUN_SPEED` | `8.5` (3D) / `400.0` (2D) | Units/s | Horizontale Höchstgeschwindigkeit |
| `ACCELERATION` | `44.0` (3D) / `2200.0` (2D) | Units/s² | Bodenbeschleunigung |
| `FRICTION` | `14.0` (3D) / `800.0` (2D) | 1/s | Abbremsrate bei Loslassen der Taste |
| `AIR_CONTROL` | `0.75` | Faktor | Horizontale Agilität in der Luft |
| `JUMP_FORCE` | `16.2` (3D) / `-770.0` (2D) | Units/s | $h_{\max} \approx 4.6$ Blöcke (überwindet 4-Block-Röhren) |
| `COYOTE_TIME_SEC` | `0.12` | Sekunden | Gnadenfrist nach Verlassen einer Kante |
| `JUMP_BUFFER_SEC` | `0.12` | Sekunden | Vorzeitige Sprungpufferung vor Bodenkontakt |
| `VARIABLE_JUMP_CUT`| `0.5` | Faktor | Geschwindigkeitskappung bei frühem Loslassen |
| `CAMERA_LERP_SPEED`| `5.0` | 1/s | Sanftheit der Kameraverfolgung |
| `DEATH_Y` | `-3.0` (3D) / `800.0` (2D) | Units / px | Y-Schwelle für Absturz in den Abgrund |

---

## Referenz-Konfiguration (TypeScript / Babylon.js)

```typescript
// config.ts
export const PLATFORMER_CONFIG = {
  tileSize: 1.0,
  playerWidth: 0.8,
  playerHeight: 0.9,
  levelHeightRows: 14,

  // Kinematik & Physik (h_max = 16.2^2 / (2 * 28) = 4.68 Blöcke)
  gravity: 28.0,
  maxRunSpeed: 8.5,
  acceleration: 44.0,
  friction: 14.0,
  airControl: 0.75,
  jumpForce: 16.2,
  variableJumpCut: 0.5,

  // Game Feel Puffer
  coyoteTimeSec: 0.12,
  jumpBufferSec: 0.12,

  // Kamera & Tiefe (2.5D)
  cameraZ: -17.5,
  cameraHeightOffset: 2.0,
  cameraLerpSpeed: 5.0,
  cameraDeadzoneX: 1.5,

  deathY: -3.0,
  startX: 2.5,
  startY: 1.0,
} as const;
```

---

## Referenz-Konfiguration (GDScript / Godot 4)

```gdscript
# config.gd
class_name PlatformerConfig
extends RefCounted

const TILE_SIZE: float = 48.0
const LEVEL_HEIGHT_ROWS: int = 14
const PLAYER_WIDTH: float = 38.0
const PLAYER_HEIGHT: float = 44.0

# Kinematik & Physik (h_max = 770^2 / (2 * 1350) = 219.6 px = 4.58 Blöcke)
const GRAVITY: float = 1350.0
const MAX_RUN_SPEED: float = 400.0
const ACCELERATION: float = 2200.0
const FRICTION: float = 800.0
const AIR_CONTROL: float = 0.75
const JUMP_FORCE: float = -770.0
const VARIABLE_JUMP_CUT: float = 0.5

const COYOTE_TIME_SEC: float = 0.12
const JUMP_BUFFER_SEC: float = 0.12

const START_X: float = 120.0
const START_Y: float = 580.0
const DEATH_Y: float = 800.0
```
