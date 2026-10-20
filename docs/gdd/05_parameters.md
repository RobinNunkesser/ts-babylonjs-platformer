# 05 - Gameplay-Parameter & Tuning

Alle physikalischen und visuellen Stellschrauben müssen in eine zentrale Konfiguration (`config.ts` bzw. `config.gd`) ausgelagert werden.

---

## Parametermatrix

| Parameter | Empfohlener Wert | Einheit | Beschreibung |
|---|---|---|---|
| `TILE_SIZE` | `1.0` (3D) / `32` (2D) | Units / px | Grundmaß einer Kachel |
| `GRAVITY` | `28.0` (3D) / `980` (2D) | Units/s² | Nach unten gerichtete Schwerkraft |
| `MAX_RUN_SPEED` | `8.0` (3D) / `250` (2D) | Units/s | Horizontale Höchstgeschwindigkeit |
| `ACCELERATION` | `40.0` (3D) / `1200` (2D) | Units/s² | Bodenbeschleunigung |
| `FRICTION` | `12.0` | 1/s | Abbremsrate bei Loslassen der Taste |
| `JUMP_FORCE` | `14.0` (3D) / `420` (2D) | Units/s | Anfangsimpuls bei Absprung |
| `COYOTE_TIME_SEC` | `0.1` | Sekunden | Gnadenfrist nach Verlassen einer Kante |
| `JUMP_BUFFER_SEC` | `0.1` | Sekunden | Vorzeitige Sprungpufferung vor Bodenkontakt |
| `VARIABLE_JUMP_CUT`| `0.5` | Faktor | Geschwindigkeitskappung bei frühem Loslassen |
| `CAMERA_LERP_SPEED`| `4.0` | 1/s | Sanftheit der Kameraverfolgung |
| `DEATH_Y` | `16.0` (unter Level) | Units | Y-Schwelle für Absturz / Game Over |

---

## Referenz-Konfiguration (TypeScript)

```typescript
// config.ts
export const PLATFORMER_CONFIG = {
  tileSize: 1.0,
  gravity: 28.0,
  maxRunSpeed: 8.0,
  acceleration: 40.0,
  friction: 12.0,
  jumpForce: 14.0,
  coyoteTimeSec: 0.1,
  jumpBufferSec: 0.1,
  variableJumpCut: 0.5,
  cameraLerpSpeed: 4.0,
  deathY: 16.0,
} as const;
```

---

## Referenz-Konfiguration (GDScript)

```gdscript
# config.gd
class_name PlatformerConfig

const TILE_SIZE: float = 32.0
const GRAVITY: float = 980.0
const MAX_RUN_SPEED: float = 250.0
const ACCELERATION: float = 1200.0
const FRICTION: float = 12.0
const JUMP_FORCE: float = -420.0
const COYOTE_TIME_SEC: float = 0.1
const JUMP_BUFFER_SEC: float = 0.1
const VARIABLE_JUMP_CUT: float = 0.5
const CAMERA_LERP_SPEED: float = 4.0
const DEATH_Y: float = 800.0
```
