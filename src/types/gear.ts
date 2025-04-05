import { CardType } from './cards';
import { Effect } from './events';
import { Faction, UUID } from './index';
import { EntityType } from './entities';
import { ModifierType, ResourceType, StatModifier } from './resources';

/**
 * Gear module
 * 
 * Contains types for equipment, augmentations, and items
 * that can be equipped by characters or entities
 */

// Base gear interface
export interface Gear {
  id: UUID;
  name: string;
  description: string;
  gearType: GearType;
  rarity: GearRarity;
  requirementLevel: number;
  requirementFaction?: Faction[];
  cost: number;
  effects: Effect[];
  slotType: GearSlotType;
  
  // Stat modifiers
  statModifiers: StatModifier[];
  
  // Resource modifiers
  resourceModifiers: ResourceModifier[];
  
  // Card modifiers (affects cards the player has)
  cardModifiers: CardModifier[];
  
  // Visual appearance
  iconUrl?: string;
  modelUrl?: string;
  
  // Additional properties
  isUnique: boolean;
  isConsumable: boolean;
  usesRemaining: number; // -1 for infinite
  cooldown: number; // -1 for no cooldown, otherwise turns
  lastUsed: number;
}

// Gear types
export enum GearType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CYBERDECK = 'cyberdeck',
  IMPLANT = 'implant',
  PROGRAM = 'program',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  SPECIAL = 'special'
}

// Gear rarity
export enum GearRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  UNIQUE = 'unique'
}

// Gear slot types
export enum GearSlotType {
  HEAD = 'head',
  BODY = 'body',
  ARMS = 'arms',
  LEGS = 'legs',
  CYBERDECK = 'cyberdeck',
  WEAPON = 'weapon',
  IMPLANT = 'implant',
  ACCESSORY = 'accessory',
  ANY = 'any'
}

// Resource modifier
export interface ResourceModifier {
  resourceType: ResourceType;
  modifierType: ModifierType;
  value: number;
}

// Card modifier (affects card properties)
export interface CardModifier {
  targetCardType?: CardType[];
  targetCardKeywords?: string[];
  modifierProperty: CardModifierProperty;
  modifierType: ModifierType;
  value: number;
}

// Card properties that can be modified
export enum CardModifierProperty {
  COST = 'cost',
  DAMAGE = 'damage',
  RANGE = 'range',
  INFLUENCE_COST = 'influenceCost',
  DURABILITY = 'durability',
  EFFECTIVENESS = 'effectiveness',
  DRAW_COUNT = 'drawCount'
}

// Weapon gear
export interface WeaponGear extends Gear {
  gearType: GearType.WEAPON;
  damageType: DamageType;
  baseDamage: number;
  range: number;
  attackSpeed: number;
  accuracy: number;
  critChance: number;
  critDamage: number;
  targetTypes: EntityType[]; // What this weapon can target
}

// Damage types
export enum DamageType {
  PHYSICAL = 'physical',
  ENERGY = 'energy',
  DIGITAL = 'digital',
  MENTAL = 'mental',
  FIRE = 'fire',
  TOXIC = 'toxic',
  COMBINED = 'combined'
}

// Armor gear
export interface ArmorGear extends Gear {
  gearType: GearType.ARMOR;
  physicalResistance: number;
  energyResistance: number;
  digitalResistance: number;
  mentalResistance: number;
  specialResistances: Record<DamageType, number>;
  moveSpeedModifier: number;
}

// Cyberdeck gear
export interface CyberdeckGear extends Gear {
  gearType: GearType.CYBERDECK;
  memorySlots: number;
  programSlots: number;
  baseHackingPower: number;
  processingSpeed: number;
  firewall: number;
  installedPrograms: UUID[];
}

// Implant gear
export interface ImplantGear extends Gear {
  gearType: GearType.IMPLANT;
  implantLocation: ImplantLocation;
  humanityLoss: number;
  sideEffects: Effect[];
  compatibility: Record<ImplantLocation, number>; // How well it works with other implants
}

// Implant locations
export enum ImplantLocation {
  BRAIN = 'brain',
  EYES = 'eyes',
  ARMS = 'arms',
  LEGS = 'legs',
  TORSO = 'torso',
  SKIN = 'skin',
  NERVOUS_SYSTEM = 'nervousSystem',
  CIRCULATORY_SYSTEM = 'circulatorySystem'
}

// Program gear (for cyberdecks)
export interface ProgramGear extends Gear {
  gearType: GearType.PROGRAM;
  memoryRequirement: number;
  activationType: ProgramActivationType;
  duration: number; // -1 for permanent, otherwise turns
  targetTypes: EntityType[];
}

// Program activation types
export enum ProgramActivationType {
  PASSIVE = 'passive',
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  AUTOMATED = 'automated'
}

// Gear system for managing equipped gear
export interface GearSystem {
  equippedGear: Record<GearSlotType, Gear | null>;
  installedPrograms: ProgramGear[];
  activeEffects: Effect[];
  
  // Methods
  equipGear(gear: Gear, slot: GearSlotType): boolean;
  unequipGear(slot: GearSlotType): Gear | null;
  installProgram(program: ProgramGear): boolean;
  uninstallProgram(programId: UUID): ProgramGear | null;
  activateGear(gearId: UUID): boolean;
  getStatModifiers(): StatModifier[];
  getResourceModifiers(): ResourceModifier[];
  getCardModifiers(): CardModifier[];
}
