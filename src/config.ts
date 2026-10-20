export const PLATFORMER_CONFIG = {
  // Koordinaten & Dimensionen
  tileSize: 1.0,           // 1 World Unit pro Kachel
  playerWidth: 0.8,        // Spieler-Breite (etwas schmaler als 1 Block für angenehmes Springen)
  playerHeight: 0.9,       // Spieler-Höhe
  levelHeightRows: 14,     // VGLC Mario 1-1 hat 14 Zeilen

  // Kinematik & Physik
  gravity: 30.0,           // Gravitationsbeschleunigung nach unten
  maxRunSpeed: 7.5,        // Maximale Laufgeschwindigkeit
  acceleration: 42.0,      // Bodenbeschleunigung
  friction: 14.0,          // Reibungsverzögerung
  airControl: 0.65,        // Reduzierte Beschleunigung in der Luft
  jumpForce: 13.5,         // Sprungimpuls
  variableJumpCut: 0.45,   // Kappung bei frühem Loslassen der Sprungtaste

  // Game Feel Puffer
  coyoteTimeSec: 0.12,     // 120 ms Gnadenfrist nach Kante
  jumpBufferSec: 0.12,     // 120 ms Vorab-Pufferung der Sprungeingabe

  // Kamera & Tiefe (2.5D)
  cameraZ: -17.5,          // Frontaler Kamera-Abstand
  cameraHeightOffset: 2.0, // Blickpunkt etwas über dem Boden
  cameraLerpSpeed: 5.0,    // Sanfte Kameraverfolgung
  cameraDeadzoneX: 1.5,    // Vorlaufbereich vor Bewegung

  // Levelgrenzen
  deathY: -3.0,            // Y-Schwelle für Absturz in Abgrund
  startX: 2.5,             // Startposition X
  startY: 1.0,             // Startposition Y (auf dem Boden)
} as const;
