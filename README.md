# Retro Platformer: VGLC Mario 1-1 Case Study

Dieses Repository enthält die modularen Micro-GDD-Spezifikationen für einen 2D/2.5D-Tile-Platformer auf Basis des wissenschaftlichen *Video Game Level Corpus* (VGLC, Summerville et al., AAAI 2016).

## Struktur

```text
platformer-mario-vglc/
├── levels/
│   └── mario-1-1.txt        # Vollständige VGLC-ASCII-Matrix von Super Mario Bros. World 1-1 (202 Spalten)
├── docs/
│   └── gdd/
│       ├── 01_concept_and_loop.md    # High Concept, Core Loop, Win/Loss
│       ├── 02_input_and_controls.md  # Kinematik, Game Feel (Coyote Time, Buffer)
│       ├── 03_architecture_dual.md   # Axis-Separation, Godot 2D vs. Babylon 2.5D
│       ├── 04_state_machine.md       # Spielzustände (READY -> PLAYING -> VICTORY/FALLEN)
│       └── 05_parameters.md          # Zentrale Konfiguration (TypeScript & GDScript)
└── README.md
```

## Didaktisches Ziel
Demonstration, wie ein plattformneutrales Micro-GDD von KI-Agenten wahlweise in:
1. **Godot 4 (2D Native):** `TileMapLayer` + `CharacterBody2D` + `move_and_slide()`
2. **Babylon.js (2.5D Web):** `InstancedMesh` bei $Z = 0$, Fixed-Z-Camera & 3D-Tiefenparallaxe

autonom implementiert und deterministisch getestet werden kann.
