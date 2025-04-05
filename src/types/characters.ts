import { UUID } from './index';
import { Deck } from './cards';
import { Gear, GearSlotType } from './gear';
import { CharacterData, GearSlot } from './entities';
import { ResourceType } from './resources';

/**
 * Characters module
 * 
 * Contains types for player characters, progression,
 * and character-specific systems
 */

// Character progression system
export interface ProgressionSystem {
  experiencePoints: number;
  level: number;
  skillPoints: number;
  spentSkillPoints: number;
  unlockedSkills: UUID[];
  skillTrees: SkillTree[];
  
  // Methods
  gainExperience(amount: number): void;
  levelUp(): void;
  canUnlockSkill(skillId: UUID): boolean;
  unlockSkill(skillId: UUID): boolean;
  getRequiredExperienceForLevel(level: number): number;
}

// Skill tree
export interface SkillTree {
  id: UUID;
  name: string;
  description: string;
  skills: Skill[];
  icon?: string;
  requiresFaction?: string;
  requiresSpecialization?: string;
}

// Skill within a skill tree
export interface Skill {
  id: UUID;
  name: string;
  description: string;
  level: number; // Current level
  maxLevel: number; // Maximum level
  icon?: string;
  requiredLevel: number; // Character level required
  requiredSkills: UUID[]; // Skills required to unlock this
  skillPointCost: number;
  effects: SkillEffect[];
}

// Skill effect
export interface SkillEffect {
  type: SkillEffectType;
  target: SkillEffectTarget;
  value: number;
}

// Skill effect types
export enum SkillEffectType {
  INCREASE_STAT = 'increaseStat',
  DECREASE_RESOURCE_COST = 'decreaseResourceCost',
  UNLOCK_CARD = 'unlockCard',
  INCREASE_RESOURCE_MAX = 'increaseResourceMax',
  INCREASE_DAMAGE = 'increaseDamage',
  INCREASE_HEALING = 'increaseHealing',
  REDUCE_COOLDOWN = 'reduceCooldown',
  ADD_SPECIAL_ABILITY = 'addSpecialAbility'
}

// Skill effect targets
export enum SkillEffectTarget {
  STRENGTH = 'strength',
  AGILITY = 'agility',
  INTELLIGENCE = 'intelligence',
  HEALTH = 'health',
  ENERGY = 'energy',
  CARDS_OF_TYPE = 'cardsOfType',
  RESOURCE_TYPE = 'resourceType',
  GEAR_TYPE = 'gearType'
}

// Faction-specific data
export interface FactionData {
  id: UUID;
  name: string;
  description: string;
  icon?: string;
  startingDeck: Deck;
  startingGear: Gear[];
  startingResources: Record<ResourceType, number>;
  skillTrees: UUID[]; // Available skill trees for this faction
  specializations: FactionSpecialization[];
}

// Faction specialization
export interface FactionSpecialization {
  id: UUID;
  name: string;
  description: string;
  icon?: string;
  bonuses: SpecializationBonus[];
  skillTree: UUID; // Unique skill tree for this specialization
  startingGear: Gear[];
}

// Specialization bonus
export interface SpecializationBonus {
  type: SpecializationBonusType;
  value: number;
  description: string;
}

// Specialization bonus types
export enum SpecializationBonusType {
  STAT_BOOST = 'statBoost',
  RESOURCE_BOOST = 'resourceBoost',
  CARD_DISCOUNT = 'cardDiscount',
  EXTRA_SLOTS = 'extraSlots',
  UNIQUE_ABILITY = 'uniqueAbility'
}

// Character template for creating new characters
export interface CharacterTemplate {
  name: string;
  faction: string;
  specialization: string;
  appearance: CharacterAppearance;
  startingSkills: UUID[];
  background: string;
}

// Character appearance
export interface CharacterAppearance {
  bodyType: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  faceType: string;
  eyeColor: string;
  facialHair?: string;
  cyberware: CyberwareAppearance[];
  clothing: ClothingAppearance;
  accessories: string[];
}

// Cyberware appearance
export interface CyberwareAppearance {
  type: string;
  location: string;
  style: string;
  color: string;
  glowColor?: string;
}

// Clothing appearance
export interface ClothingAppearance {
  head?: string;
  torso: string;
  arms: string;
  legs: string;
  feet: string;
  outerwear?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Character manager system
export interface CharacterManager {
  characters: CharacterData[];
  activeCharacterId: UUID | null;
  
  // Methods
  createCharacter(template: CharacterTemplate): CharacterData;
  loadCharacter(id: UUID): CharacterData | null;
  saveCharacter(character: CharacterData): boolean;
  deleteCharacter(id: UUID): boolean;
  equipGear(characterId: UUID, gear: Gear, slot: GearSlot): boolean;
  gainExperience(characterId: UUID, amount: number): boolean;
  learnSkill(characterId: UUID, skillId: UUID): boolean;
}
