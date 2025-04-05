/**
 * Core game types module
 * 
 * This file exports all game-related types, enums, and interfaces
 * to provide a centralized typing system for the application.
 */

// Re-export all type modules
export * from './resources';
export * from './cards';
export * from './events';
export * from './entities';
export * from './gear';
export * from './characters';
export * from './agendas';
export * from './common';

// Core shared types
export type UUID = string;
export type Timestamp = number;

// Game modes
export enum GameMode {
  TACTICAL = 'TACTICAL', 
  OVERWORLD = 'OVERWORLD'
}

// Game phases
export enum GamePhase {
  UPKEEP_PHASE = 'UPKEEP_PHASE',
  ACTION_PHASE = 'ACTION_PHASE',
  RESOLUTION_PHASE = 'RESOLUTION_PHASE',
  ENEMY_TURN = 'ENEMY_TURN',
  GAME_OVER = 'GAME_OVER'
}

// Hex grid types
export interface HexCoord {
  q: number;
  r: number;
}

export interface CubeCoord {
  q: number; // x axis
  r: number; // z axis
  s: number; // y axis (derived: s = -q-r)
}

// Core save game type
export interface GameSaveData {
  version: string;
  timestamp: Timestamp;
  playerData: CharacterData;
  worldState: WorldState;
  missionState?: MissionState;
}

export interface WorldState {
  territories: Territory[];
  globalEvents: Event[];
  turnCount: number;
  playerFaction: Faction;
  discoveredLocations: UUID[];
}

export interface MissionState {
  activeMission: UUID | null;
  hexGrid: HexTile[];
  entities: Entity[];
  deployedGear: UUID[];
  activeEvents: Event[];
  turnCount: number;
  gamePhase: GamePhase;
}

export interface HexTile {
  id: UUID;
  coord: HexCoord;
  type: TileType;
  elevation: number;
  controllableBy?: Faction;
  controlledBy?: Faction;
  influenceLevel?: number;
  interactables?: Entity[];
}

export enum TileType {
  NORMAL = 'normal',
  BLOCKED = 'blocked',
  SPECIAL = 'special',
  WATER = 'water',
  HIGH_GROUND = 'high_ground',
  COVER = 'cover',
  ICE = 'ice'
}

export interface Territory {
  id: UUID;
  name: string;
  type: TerritoryType;
  coord: HexCoord;
  influenceLevel: number; // 0-100, with 0 being full runner control, 100 being full corp control
  controlledBy: Faction;
  mission?: boolean; // Whether there's an available mission here
  securityLevel?: number; // 1-5 scale of difficulty
  resourceValue?: number; // Base resource generation
  connectedTerritories: UUID[];
  specialEffects?: Effect[];
}

export enum TerritoryType {
  CORPORATE = 'corporate',
  SLUMS = 'slums',
  FRINGE = 'fringe',
  NEUTRAL = 'neutral',
  DATA_HUB = 'data_hub',
  BLACK_MARKET = 'black_market',
  RESIDENTIAL = 'residential'
}
