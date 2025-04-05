import { Faction, HexCoord, UUID } from './index';
import { ResourceTracker, Stats } from './resources';
import { Effect } from './events';
import { Gear } from './gear';

/**
 * Entities module
 * 
 * Contains types for all game entities including NPCs,
 * buildings, objects, and other interactable elements
 */

// Base entity interface
export interface Entity {
  id: UUID;
  name: string;
  description: string;
  entityType: EntityType;
  faction: Faction;
  position?: HexCoord;
  isActive: boolean;
  tags: string[];
  interactable: boolean;
  visibleToFactions: Faction[];
  
  // Optional components
  resources?: ResourceTracker;
  stats?: Stats;
  inventory?: Inventory;
  ai?: AIComponent;
  appearance?: AppearanceComponent;
  interactions?: InteractionComponent[];
  
  // Status effects and modifiers
  statusEffects: StatusEffect[];
  appliedGear: Gear[];
}

// Entity types
export enum EntityType {
  // Characters
  PLAYER = 'player',
  NPC = 'npc',
  ENEMY = 'enemy',
  
  // Structures
  BUILDING = 'building',
  TERMINAL = 'terminal',
  DOOR = 'door',
  BARRIER = 'barrier',
  
  // Special objects
  LOOT_CONTAINER = 'lootContainer',
  TRAP = 'trap',
  INTERACTABLE = 'interactable',
  DATA_NODE = 'dataNode',
  ICE = 'ice',
  SERVER = 'server',
  
  // Environmental
  COVER = 'cover',
  HAZARD = 'hazard',
  SPAWN_POINT = 'spawnPoint',
  
  // Special
  DRONE = 'drone',
  TURRET = 'turret',
  HOLOGRAM = 'hologram'
}

// Entity status effect
export interface StatusEffect {
  id: UUID;
  name: string;
  description: string;
  duration: number; // -1 for permanent, otherwise turns
  startedAt: number; // turn when applied
  effects: Effect[];
  source: UUID; // ID of entity or card that applied this
  isStackable: boolean;
  maxStacks?: number;
  currentStacks: number;
  iconUrl?: string;
}

// AI component for NPCs and enemies
export interface AIComponent {
  aiType: AIType;
  behaviorTree: BehaviorNode;
  awareness: number; // 0-100, how aware the AI is of the player
  alertness: number; // 0-100, how alert/suspicious the AI is
  patrolPath?: HexCoord[];
  currentPatrolIndex?: number;
  detectedEntities: UUID[];
  lastKnownPlayerPosition?: HexCoord;
  customParameters: Record<string, any>; // For AI-specific parameters
}

// AI types
export enum AIType {
  STATIONARY = 'stationary',
  PATROL = 'patrol',
  GUARD = 'guard',
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  FLEE = 'flee',
  SUPPORT = 'support',
  BOSS = 'boss',
  CUSTOM = 'custom'
}

// Behavior tree node
export interface BehaviorNode {
  id: UUID;
  nodeType: BehaviorNodeType;
  children?: BehaviorNode[];
  condition?: BehaviorCondition;
  action?: BehaviorAction;
  priority?: number;
}

// Behavior node types
export enum BehaviorNodeType {
  SEQUENCE = 'sequence',
  SELECTOR = 'selector',
  PARALLEL = 'parallel',
  CONDITION = 'condition',
  ACTION = 'action',
  DECORATOR = 'decorator'
}

// Behavior condition (for decision making)
export interface BehaviorCondition {
  conditionType: ConditionType;
  parameters: Record<string, any>;
}

// Condition types
export enum ConditionType {
  IS_PLAYER_VISIBLE = 'isPlayerVisible',
  IS_HEALTH_BELOW = 'isHealthBelow',
  IS_IN_RANGE = 'isInRange',
  HAS_PATH_TO = 'hasPathTo',
  IS_THREATENED = 'isThreatened',
  HAS_ALLY_NEARBY = 'hasAllyNearby',
  IS_OBJECTIVE_COMPLETE = 'isObjectiveComplete',
  CUSTOM = 'custom'
}

// Behavior action (what the AI does)
export interface BehaviorAction {
  actionType: ActionType;
  parameters: Record<string, any>;
}

// Action types
export enum ActionType {
  MOVE_TO = 'moveTo',
  ATTACK = 'attack',
  USE_ABILITY = 'useAbility',
  FLEE = 'flee',
  PATROL = 'patrol',
  ALERT_ALLIES = 'alertAllies',
  SEARCH_AREA = 'searchArea',
  INTERACT_WITH = 'interactWith',
  WAIT = 'wait',
  CUSTOM = 'custom'
}

// Inventory component
export interface Inventory {
  items: InventoryItem[];
  maxItems: number;
  credits: number;
}

// Inventory item
export interface InventoryItem {
  id: UUID;
  name: string;
  description: string;
  quantity: number;
  value: number;
  itemType: ItemType;
  effects: Effect[];
  usable: boolean;
  consumable: boolean;
  iconUrl?: string;
}

// Item types
export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  KEY = 'key',
  DATA = 'data',
  JUNK = 'junk',
  CURRENCY = 'currency',
  GEAR = 'gear',
  QUEST = 'quest'
}

// Appearance component (for visualization)
export interface AppearanceComponent {
  modelUrl?: string;
  textureUrl?: string;
  iconUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  scale?: number;
  animations?: Record<string, string>; // animationName -> animationUrl
  particles?: ParticleEffect[];
}

// Particle effect
export interface ParticleEffect {
  id: UUID;
  particleType: string;
  color: string;
  size: number;
  lifetime: number;
  emissionRate: number;
  offset: { x: number, y: number, z: number };
}

// Interaction component
export interface InteractionComponent {
  id: UUID;
  name: string;
  description: string;
  interactionType: InteractionType;
  requiredItems?: UUID[];
  requiredFaction?: Faction[];
  requiredStats?: Record<string, number>;
  cooldown: number; // -1 for no cooldown, otherwise turns
  lastUsed: number;
  usesRemaining: number; // -1 for infinite uses
  effectsOnUse: Effect[];
  isAvailable: boolean;
  iconUrl?: string;
}

// Interaction types
export enum InteractionType {
  HACK = 'hack',
  COMBAT = 'combat',
  DIALOG = 'dialog',
  LOOT = 'loot',
  UNLOCK = 'unlock',
  REPAIR = 'repair',
  USE = 'use',
  ANALYZE = 'analyze',
  SABOTAGE = 'sabotage',
  CUSTOM = 'custom'
}

// Character data (for players and important NPCs)
export interface CharacterData extends Entity {
  entityType: EntityType.PLAYER | EntityType.NPC;
  
  // Character-specific data
  background: string;
  specialization: Specialization;
  skills: Skill[];
  experience: number;
  level: number;
  reputation: Record<Faction, number>; // Reputation with different factions
  
  // Progression
  skillPoints: number;
  unlockedAbilities: UUID[];
  completedMissions: UUID[];
  
  // Inventory and resources
  deck: UUID; // Reference to character's deck
  equippedGear: Record<GearSlot, UUID | null>;
}

// Character specializations
export enum Specialization {
  // Runner specializations
  NETRUNNER = 'netrunner',
  ENFORCER = 'enforcer',
  GHOST = 'ghost',
  TECHIE = 'techie',
  
  // Corp specializations
  EXECUTIVE = 'executive',
  SECURITY = 'security',
  RESEARCHER = 'researcher',
  OPERATOR = 'operator'
}

// Skill interface
export interface Skill {
  id: UUID;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  statModifiers: Record<string, number>;
  unlocksAt: number[];
}

// Gear slots
export enum GearSlot {
  HEAD = 'head',
  BODY = 'body',
  ARMS = 'arms',
  LEGS = 'legs',
  CYBERDECK = 'cyberdeck',
  WEAPON_PRIMARY = 'weaponPrimary',
  WEAPON_SECONDARY = 'weaponSecondary',
  IMPLANT_1 = 'implant1',
  IMPLANT_2 = 'implant2',
  ACCESSORY = 'accessory'
}
