import { Faction, UUID } from './index';

/**
 * Resources and stats module
 * 
 * Contains definitions for all player and entity resources,
 * stats, and tracked values in the game.
 */

// Generic resource type
export interface Resource {
  id: UUID;
  name: string;
  description: string;
  value: number;
  maxValue?: number;
  minValue?: number;
  regenerationRate?: number;
  temporary?: boolean;
  expiresAt?: number;
}

// Core resource types
export enum ResourceType {
  CREDITS = 'credits',
  INFLUENCE = 'influence',
  BAD_PR = 'badPR',
  CLICK = 'click',
  BRAIN_DAMAGE = 'brainDamage',
  MEAT_DAMAGE = 'meatDamage',
  TAG = 'tag',
  LINK = 'link',
  MEMORY = 'memory',
  VIRUS_COUNTER = 'virusCounter',
  ADVANCEMENT_TOKEN = 'advancementToken',
  POWER_TOKEN = 'powerToken',
  RECURRING_CREDIT = 'recurringCredit'
}

// Resource tracker for managing multiple resources
export interface ResourceTracker {
  resources: Record<ResourceType, Resource>;
  
  // Temporary status effects
  statusEffects: StatusEffect[];
  
  // Tags are special tracked resources with additional metadata
  tags: Tag[];
}

// Status effect that can modify resources
export interface StatusEffect {
  id: UUID;
  name: string;
  description: string;
  appliedAt: number;
  duration: number; // in turns, -1 for permanent
  resourceModifiers: ResourceModifier[];
  sourceId?: UUID; // ID of the entity/card that applied this effect
  canStack: boolean;
  maxStacks?: number;
  currentStacks: number;
}

// Modifier for resources
export interface ResourceModifier {
  resourceType: ResourceType;
  modifierType: ModifierType;
  value: number;
  permanent: boolean;
  appliesTo?: Faction[]; // If undefined, applies to all factions
}

// Tags are special resources that can be applied and removed
export interface Tag {
  id: UUID;
  type: TagType;
  appliedAt: number;
  expiresAt?: number;
  sourceId?: UUID;
}

// Tag types
export enum TagType {
  RUNNER = 'runner',
  CORP = 'corp',
  LINK = 'link',
  STEALTH = 'stealth',
  SECURITY = 'security'
}

// Modifier types
export enum ModifierType {
  ADDITIVE = 'additive',
  MULTIPLICATIVE = 'multiplicative',
  SET_VALUE = 'setValue',
  SET_MAX = 'setMax',
  SET_MIN = 'setMin'
}

// Stats for characters and entities
export interface Stats {
  // Core stats
  strength: number;
  agility: number;
  intelligence: number;
  
  // Derived stats
  maxHealth: number;
  maxBrainHealth: number;
  maxEnergy: number;
  maxClicks: number;
  
  // Combat stats
  attack: number;
  defense: number;
  hackingPower: number;
  moveRange: number;
  
  // Augmentations can modify these stats
  augmentations: Augmentation[];
}

// Augmentation that can modify stats
export interface Augmentation {
  id: UUID;
  name: string;
  description: string;
  statModifiers: StatModifier[];
  requirements?: { [key: string]: number }; // Requirements to install this augmentation
  slots: number; // How many augmentation slots this takes up
  installed: boolean;
}

// Stat modifier
export interface StatModifier {
  statName: keyof Stats;
  modifierType: ModifierType;
  value: number;
}
