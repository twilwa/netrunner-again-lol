/**
 * Common types shared across the application
 */

// Faction enum - the core game factions
export enum Faction {
  RUNNER = 'runner',
  CORP = 'corp',
  NEUTRAL = 'neutral',
  
  // Corp subfactions
  WEYLAND = 'weyland',
  NBN = 'nbn',
  JINTEKI = 'jinteki',
  HAAS_BIOROID = 'haasBioroid',
  
  // Runner subfactions
  SHAPER = 'shaper',
  CRIMINAL = 'criminal',
  ANARCH = 'anarch',
  
  // Special factions
  INDEPENDENT = 'independent',
  BLACK_OPS = 'blackOps',
  GOVERNMENT = 'government'
}

// Result types for game actions
export enum ResultType {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL_SUCCESS = 'partialSuccess',
  CRITICAL_SUCCESS = 'criticalSuccess',
  CRITICAL_FAILURE = 'criticalFailure'
}

// Direction enum for hex grid movement
export enum Direction {
  NORTHEAST = 'northeast',
  EAST = 'east',
  SOUTHEAST = 'southeast',
  SOUTHWEST = 'southwest',
  WEST = 'west',
  NORTHWEST = 'northwest'
}

// Game difficulty levels
export enum DifficultyLevel {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  NIGHTMARE = 'nightmare',
  CUSTOM = 'custom'
}

// Game settings
export interface GameSettings {
  difficulty: DifficultyLevel;
  audioEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  showTutorials: boolean;
  autoSave: boolean;
  language: string;
  displaySettings: DisplaySettings;
  accessibilitySettings: AccessibilitySettings;
  customDifficulty?: CustomDifficultySettings;
}

// Display settings
export interface DisplaySettings {
  resolution: string;
  fullscreen: boolean;
  showFps: boolean;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  uiScale: number;
}

// Accessibility settings
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReaderEnabled: boolean;
}

// Custom difficulty settings
export interface CustomDifficultySettings {
  playerDamageMultiplier: number;
  enemyDamageMultiplier: number;
  resourceGainMultiplier: number;
  enemyCount: number;
  startingCredits: number;
  cardDrawPerTurn: number;
  maxClicksPerTurn: number;
}

// Game achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUnlocked: string;
  iconLocked: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  isHidden: boolean;
  category: AchievementCategory;
}

// Achievement categories
export enum AchievementCategory {
  STORY = 'story',
  GAMEPLAY = 'gameplay',
  COLLECTION = 'collection',
  CHALLENGE = 'challenge',
  SECRET = 'secret',
  PROGRESSION = 'progression'
}
