import { Effect, EffectType, TargetType } from './events';
import { Faction, UUID } from './index';
import { ResourceType } from './resources';

/**
 * Cards module
 * 
 * Contains all card-related types and enums for the game
 */

// Base card interface
export interface Card {
  id: UUID;
  name: string;
  cost: number;
  artUrl?: string;
  description: string;
  flavor?: string;
  faction: Faction;
  rarity: CardRarity;
  cardSet: string;
  keywords: string[];
  effects: Effect[];
  
  // Metadata
  cardType: CardType;
  context: CardContext; // Where this card can be played
  
  // Optional properties
  subTypes?: string[];
  influenceCost?: number;
  restrictions?: PlayRestriction[];
}

// Card rarity
export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// Card contexts - where the card can be played
export enum CardContext {
  OVERWORLD = 'overworld',
  TACTICAL = 'tactical',
  BOTH = 'both'
}

// Card types
export enum CardType {
  // Basic card types
  ATTACK = 'attack',
  MOVE = 'move',
  SKILL = 'skill',
  HACK = 'hack',
  RESOURCE = 'resource',
  
  // Advanced card types
  AGENDA = 'agenda',
  ASSET = 'asset',
  EVENT = 'event',
  HARDWARE = 'hardware',
  ICE = 'ice',
  OPERATION = 'operation',
  PROGRAM = 'program',
  UPGRADE = 'upgrade',
  
  // Special card types
  IDENTITY = 'identity',
  CONSOLE = 'console'
}

// Agenda card interface
export interface AgendaCard extends Card {
  cardType: CardType.AGENDA;
  advancementRequirement: number;
  agendaPoints: number;
  isAdvanced: boolean;
  currentAdvancement: number;
  isStolen: boolean;
  effectsWhenScored: Effect[];
}

// ICE card interface
export interface IceCard extends Card {
  cardType: CardType.ICE;
  strength: number;
  subroutines: Subroutine[];
  isRezzed: boolean;
  iceType: IceType;
}

// ICE types
export enum IceType {
  BARRIER = 'barrier',
  CODE_GATE = 'code_gate',
  SENTRY = 'sentry',
  MULTI = 'multi'
}

// Subroutine interface
export interface Subroutine {
  id: UUID;
  name: string;
  description: string;
  effects: Effect[];
  isBroken: boolean;
}

// Identity card interface
export interface IdentityCard extends Card {
  cardType: CardType.IDENTITY;
  baseHandSize: number;
  linkStrength?: number; // For Runner
  influenceLimit: number;
  specialAbility: Effect[];
  minimumDeckSize: number;
}

// Play restrictions
export interface PlayRestriction {
  type: RestrictionType;
  value: any;
  description: string;
}

// Restriction types
export enum RestrictionType {
  FACTION = 'faction',
  RESOURCE_REQUIRED = 'resourceRequired',
  TERRITORY_TYPE = 'territoryType',
  CARD_PLAYED_THIS_TURN = 'cardPlayedThisTurn',
  ENTITY_TYPE_PRESENT = 'entityTypePresent',
  IN_COMBAT = 'inCombat',
  HAS_TAG = 'hasTag'
}

// Card deck
export interface Deck {
  id: UUID;
  name: string;
  faction: Faction;
  identity?: IdentityCard;
  cards: Card[];
  isValid: boolean;
  validationIssues?: string[];
}

// Card collection - what the player owns
export interface CardCollection {
  cards: {
    [cardId: string]: {
      count: number;
      card: Card;
    }
  };
}

// Double-sided card
export interface DoubleSidedCard extends Card {
  frontSide: Card;
  backSide: Card;
  currentSide: 'front' | 'back';
  flipTriggers: FlipTrigger[];
}

// Flip trigger
export interface FlipTrigger {
  type: TriggerType;
  condition: any;
  description: string;
}

// Trigger types
export enum TriggerType {
  RESOURCE_THRESHOLD = 'resourceThreshold',
  CLICK_SPENT = 'clickSpent',
  DAMAGE_TAKEN = 'damageTaken',
  CARD_PLAYED = 'cardPlayed',
  ENEMY_DEFEATED = 'enemyDefeated',
  AGENDA_SCORED = 'agendaScored',
  AGENDA_STOLEN = 'agendaStolen',
  MANUAL = 'manual'
}

// Resource threshold trigger
export interface ResourceThresholdTrigger extends FlipTrigger {
  type: TriggerType.RESOURCE_THRESHOLD;
  condition: {
    resourceType: ResourceType;
    threshold: number;
    comparison: 'lessThan' | 'greaterThan' | 'equalTo';
  };
}
