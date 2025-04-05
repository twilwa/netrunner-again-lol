import { UUID, HexCoord } from './index';
import { EntityType } from './entities';

/**
 * Events module
 * 
 * Contains types related to game events, effects, and triggers
 */

// Base event interface
export interface Event {
  id: UUID;
  name: string;
  description: string;
  duration: number; // -1 for permanent, otherwise number of turns
  startedAt: number; // turn number when event started
  context: EventContext;
  effects: Effect[];
  triggers: EventTrigger[];
  targetType: TargetType;
  targetIds?: UUID[]; // IDs of targets if specific entities
  targetCoords?: HexCoord[]; // Coordinates if targeting locations
  targetRadius?: number; // Radius if area effect
  isActive: boolean;
  isSilent: boolean; // Whether to show notifications
  priority: number; // Order of execution
}

// Event contexts
export enum EventContext {
  OVERWORLD = 'overworld',
  TACTICAL = 'tactical',
  BOTH = 'both'
}

// Event trigger interface
export interface EventTrigger {
  id: UUID;
  triggerType: TriggerType;
  condition: any; // Type depends on triggerType
  effectsOnTrigger: Effect[];
  hasTriggered: boolean;
  maxTriggerCount?: number; // Max number of times this can trigger
  currentTriggerCount: number;
}

// Trigger types
export enum TriggerType {
  ON_TURN_START = 'onTurnStart',
  ON_TURN_END = 'onTurnEnd',
  ON_PHASE_START = 'onPhaseStart',
  ON_PHASE_END = 'onPhaseEnd',
  ON_DAMAGE_TAKEN = 'onDamageTaken',
  ON_DAMAGE_DEALT = 'onDamageDealt',
  ON_RESOURCE_GAINED = 'onResourceGained',
  ON_RESOURCE_SPENT = 'onResourceSpent',
  ON_CARD_PLAYED = 'onCardPlayed',
  ON_ENTITY_MOVED = 'onEntityMoved',
  ON_ENTITY_ENTERS_AREA = 'onEntityEntersArea',
  ON_ENTITY_LEAVES_AREA = 'onEntityLeavesArea',
  ON_ENTITY_DEFEATED = 'onEntityDefeated',
  ON_TERRITORY_CONTROL_CHANGED = 'onTerritoryControlChanged',
  ON_AGENDA_SCORED = 'onAgendaScored',
  ON_AGENDA_STOLEN = 'onAgendaStolen',
  ON_CUSTOM_CONDITION = 'onCustomCondition',
  MANUAL = 'manual'
}

// Effect interface
export interface Effect {
  id: UUID;
  name: string;
  description: string;
  effectType: EffectType;
  targetType: TargetType;
  targetIds?: UUID[]; // IDs of targets if specific entities
  targetCoords?: HexCoord[]; // Coordinates if targeting locations
  targetRadius?: number; // Radius if area effect
  targetEntityTypes?: EntityType[]; // Types of entities to target
  parameters: any; // Parameters specific to the effect type
  duration: number; // -1 for instant, otherwise number of turns
  isStackable: boolean;
  maxStacks?: number;
  currentStacks: number;
  executionPriority: number; // Order of execution
}

// Effect types
export enum EffectType {
  // Resource effects
  MODIFY_RESOURCE = 'modifyResource',
  TRANSFER_RESOURCE = 'transferResource',
  
  // Damage and healing
  DEAL_DAMAGE = 'dealDamage',
  HEAL = 'heal',
  
  // Movement and position
  MOVE_ENTITY = 'moveEntity',
  TELEPORT = 'teleport',
  PUSH = 'push',
  PULL = 'pull',
  
  // Status effects
  APPLY_STATUS = 'applyStatus',
  REMOVE_STATUS = 'removeStatus',
  
  // Card effects
  DRAW_CARD = 'drawCard',
  DISCARD_CARD = 'discardCard',
  PLAY_CARD = 'playCard',
  MODIFY_CARD_COST = 'modifyCardCost',
  
  // Entity effects
  SPAWN_ENTITY = 'spawnEntity',
  REMOVE_ENTITY = 'removeEntity',
  MODIFY_ENTITY_STAT = 'modifyEntityStat',
  
  // Territory effects
  MODIFY_INFLUENCE = 'modifyInfluence',
  CHANGE_TERRITORY_CONTROL = 'changeTerritoryControl',
  MODIFY_SECURITY_LEVEL = 'modifySecurityLevel',
  
  // Agenda effects
  ADVANCE_AGENDA = 'advanceAgenda',
  SCORE_AGENDA = 'scoreAgenda',
  STEAL_AGENDA = 'stealAgenda',
  
  // Special effects
  TRIGGER_EVENT = 'triggerEvent',
  EXECUTE_CUSTOM_LOGIC = 'executeCustomLogic'
}

// Target types
export enum TargetType {
  SELF = 'self',
  SINGLE_ENTITY = 'singleEntity',
  MULTIPLE_ENTITIES = 'multipleEntities',
  ALL_ENTITIES = 'allEntities',
  SINGLE_LOCATION = 'singleLocation',
  AREA = 'area',
  ALL_FRIENDLY = 'allFriendly',
  ALL_ENEMY = 'allEnemy',
  RANDOM_ENTITY = 'randomEntity',
  RANDOM_FRIENDLY = 'randomFriendly',
  RANDOM_ENEMY = 'randomEnemy',
  TERRITORY = 'territory',
  GLOBAL = 'global'
}

// Advanced event system for ongoing effects
export interface EventSystem {
  activeEvents: Event[];
  eventHistory: Event[];
  queuedEvents: Event[];
  
  /**
   * Process all active events
   */
  processEvents(context: EventContext): void;
  
  /**
   * Add a new event to the system
   */
  addEvent(event: Event): void;
  
  /**
   * Remove an event from the system
   */
  removeEvent(eventId: UUID): void;
  
  /**
   * Trigger events of a specific type
   */
  triggerEvents(triggerType: TriggerType, data: any): void;
}
