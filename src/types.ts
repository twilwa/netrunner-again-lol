export interface HexCoord {
  q: number;
  r: number;
}

export interface HexTile {
  id: string;
  coord: HexCoord;
  type: 'normal' | 'blocked' | 'special';
  elevation: number;
  controllableBy?: string;
  controlledBy?: string;
  influenceLevel?: number;
}

export interface Territory {
  id: string;
  name: string;
  type: 'corporate' | 'slums' | 'fringe' | 'neutral';
  coord: HexCoord;
  influenceLevel: number; // 0-100, with 0 being full runner control, 100 being full corp control
  controlledBy: 'runner' | 'corp' | 'neutral';
  mission?: boolean; // Whether there's an available mission here
  securityLevel?: number; // 1-5 scale of difficulty
  resourceValue?: number; // Base resource generation
}

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: 'attack' | 'move' | 'skill' | 'hack' | 'resource';
  faction: string;
  description: string;
  effect: (state: any) => any;
  range?: number;
  damage?: number;
  influenceCost?: number;
}

export interface Player {
  id: string;
  name: string;
  position: HexCoord;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
}

export interface Enemy {
  id: string;
  name: string;
  position: HexCoord;
  health: number;
  maxHealth: number;
}

// New enums and types for improved action system
export enum GamePhase {
  UPKEEP = 'UPKEEP_PHASE',
  ACTION = 'ACTION_PHASE',
  RESOLUTION = 'RESOLUTION_PHASE',
  ENEMY_TURN = 'ENEMY_TURN',
  GAME_OVER = 'GAME_OVER'
}

export enum ActionType {
  PLAY_CARD = 'PLAY_CARD',
  BASIC_MOVE = 'BASIC_MOVE',
  BASIC_ATTACK = 'BASIC_ATTACK',
  INTERACT = 'INTERACT',
  DRAW_CARD = 'DRAW_CARD'
}

export interface QueuedAction {
  id: string;
  type: ActionType;
  target?: HexCoord | string; // Hex coordinate for moves, entity ID for attacks
  card?: Card;
  cost: number; // Energy cost
  clickCost: number; // Click cost (typically 1)
  description: string;
  previewEffect?: (state: any) => any; // Function to preview effect without applying
}
