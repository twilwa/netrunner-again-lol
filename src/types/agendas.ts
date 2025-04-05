import { Effect } from './events';
import { Faction, UUID } from './index';

/**
 * Agendas module
 * 
 * Contains types for Corp agendas, scoring, and related mechanics
 */

// Agenda interface
export interface Agenda {
  id: UUID;
  name: string;
  description: string;
  artUrl?: string;
  faction: Faction;
  advancementRequirement: number;
  agendaPoints: number;
  currentAdvancement: number;
  advancementEffects: AdvancementEffect[];
  isAdvancing: boolean;
  isScored: boolean;
  isStolen: boolean;
  scoredBy: UUID | null; // ID of the entity that scored it
  scoredAt: number; // Turn when it was scored
  effectsWhenScored: Effect[];
  effectsWhenStolen: Effect[];
  
  // Special agenda properties
  agendaType: AgendaType;
  requirementsToAdvance?: AdvancementRequirement[];
  protectionMechanisms?: ProtectionMechanism[];
}

// Agenda types
export enum AgendaType {
  STANDARD = 'standard',
  SECURITY = 'security',
  EXPANSION = 'expansion',
  RESEARCH = 'research',
  POLITICAL = 'political',
  PROTOTYPE = 'prototype',
  AMBUSH = 'ambush'
}

// Advancement effect (triggers at specific advancement levels)
export interface AdvancementEffect {
  advancementLevel: number;
  effects: Effect[];
  hasTriggered: boolean;
}

// Requirements to advance an agenda
export interface AdvancementRequirement {
  requirementType: AdvancementRequirementType;
  value: any;
  description: string;
}

// Advancement requirement types
export enum AdvancementRequirementType {
  RESOURCE_COST = 'resourceCost',
  CONTROLLED_TERRITORY = 'controlledTerritory',
  ENTITY_TYPE_PRESENT = 'entityTypePresent',
  SECURITY_LEVEL = 'securityLevel',
  FACTION_INFLUENCE = 'factionInfluence',
  CARD_PLAYED = 'cardPlayed',
  CUSTOM = 'custom'
}

// Protection mechanism for agendas
export interface ProtectionMechanism {
  protectionType: ProtectionType;
  strength: number;
  description: string;
  canBeBypassedBy: BypassMethod[];
}

// Protection types
export enum ProtectionType {
  ICE = 'ice',
  ENCRYPTION = 'encryption',
  PHYSICAL = 'physical',
  PERSONNEL = 'personnel',
  TRAP = 'trap',
  CUSTOM = 'custom'
}

// Bypass methods
export enum BypassMethod {
  HACKING = 'hacking',
  FORCE = 'force',
  STEALTH = 'stealth',
  SPECIAL_CARD = 'specialCard',
  SPECIAL_ABILITY = 'specialAbility',
  KEY_ITEM = 'keyItem'
}

// Agenda tracker system
export interface AgendaTracker {
  availableAgendas: Agenda[];
  installedAgendas: Agenda[];
  scoredAgendas: Agenda[];
  stolenAgendas: Agenda[];
  
  // Methods
  installAgenda(agendaId: UUID, serverId: UUID): boolean;
  advanceAgenda(agendaId: UUID, amount: number): boolean;
  scoreAgenda(agendaId: UUID): boolean;
  stealAgenda(agendaId: UUID, runnerId: UUID): boolean;
  getAgendaPoints(faction: Faction): number;
}
