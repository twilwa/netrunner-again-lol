export interface HexCoord {
  q: number;
  r: number;
}

export enum HexType {
  NORMAL = 'normal',
  BLOCKED = 'blocked',
  SPECIAL = 'special',
  OBJECTIVE = 'objective',
  HAZARD = 'hazard'
}

export enum Faction {
  RUNNER = 'runner',
  CORP = 'corp',
  NEUTRAL = 'neutral',
  CRIMINAL = 'criminal',
  ANARCH = 'anarch',
  SHAPER = 'shaper'
}

export enum CardType {
  ATTACK = 'attack',
  MOVE = 'move',
  SKILL = 'skill',
  HACK = 'hack',
  RESOURCE = 'resource',
  DEFENSE = 'defense',
  SPECIAL = 'special'
}

export enum TerritoryType {
  CORPORATE = 'corporate',
  SLUMS = 'slums',
  FRINGE = 'fringe',
  NEUTRAL = 'neutral'
}

export enum GamePhase {
  UPKEEP_PHASE = 'UPKEEP_PHASE',
  ACTION_PHASE = 'ACTION_PHASE',
  RESOLUTION_PHASE = 'RESOLUTION_PHASE',
  ENEMY_TURN = 'ENEMY_TURN',
  GAME_OVER = 'GAME_OVER'
}

export interface HexTile {
  id: string;
  coord: HexCoord;
  type: HexType | string;
  elevation: number;
  controllableBy?: string;
  controlledBy?: string;
  influenceLevel?: number;
}

export interface Territory {
  id: string;
  name: string;
  type: TerritoryType | string;
  coord: HexCoord;
  influenceLevel: number; // 0-100, with 0 being full runner control, 100 being full corp control
  controlledBy: Faction | string;
  mission?: boolean; // Whether there's an available mission here
  securityLevel?: number; // 1-5 scale of difficulty
  resourceValue?: number; // Base resource generation
  lastUpdate?: string; // ISO timestamp of last update
}

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType | string;
  faction: Faction | string;
  description: string;
  effect: (state: any) => any;
  range?: number;
  damage?: number;
  influenceCost?: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  cost: number;
  modifiers: {
    [key: string]: number | string | boolean;
  };
  requirements?: {
    [key: string]: number | string | boolean;
  };
}

export interface Player {
  id: string;
  name: string;
  position: HexCoord;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  equipment?: Equipment[];
}

export interface Enemy {
  id: string;
  name: string;
  position: HexCoord;
  health: number;
  maxHealth: number;
  type?: string;
  abilities?: string[];
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  playerDeck: Card[];
  playerHand: Card[];
  playerDiscard: Card[];
  playerCredits: number;
  playerInfluencePoints: number;
  activeCard: Card | null;
  hexGrid: HexTile[];
  territories: Territory[];
  turnCount: number;
  gamePhase: GamePhase | string;
  activeMission: string | null;
  clicksRemaining: number;
  maxClicks: number;
  selectedTerritory: string | null;
  selectedTacticalHex: HexCoord | null;
  playerFaction: Faction | string;
  notifications: string[];
  pendingActions: any[];
  marketplaceCards: Card[];
  overworldHand: Card[];
}

export interface GameEvent {
  id: string;
  type: string;
  territoryId?: string;
  playerId?: string;
  data: any;
  timestamp: string;
}
