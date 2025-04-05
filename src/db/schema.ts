/**
 * Supabase database schema definitions
 * 
 * This file defines the database schema for all game data
 */

export interface DbSchema {
  // Users and accounts
  users: {
    id: string;
    email: string;
    created_at: string;
    username: string;
    last_login: string;
    is_admin: boolean;
  };

  // Characters
  characters: {
    id: string;
    user_id: string;
    name: string;
    faction: string;
    specialization: string;
    level: number;
    experience: number;
    credits: number;
    influence: number;
    stats: { [key: string]: number };
    skills: string[]; // IDs of unlocked skills
    created_at: string;
    last_played: string;
  };

  // Character progress
  character_progression: {
    id: string;
    character_id: string;
    skill_points: number;
    skill_trees: { [key: string]: number[] }; // Skill tree ID -> unlocked skill IDs
    completed_missions: string[];
    discovered_locations: string[];
    reputation: { [faction: string]: number };
  };

  // Inventory
  character_inventory: {
    id: string;
    character_id: string;
    gear: {
      id: string;
      equipped: boolean;
      slot?: string;
      durability?: number;
      modifications?: any[];
    }[];
    items: {
      id: string;
      quantity: number;
    }[];
    credits: number;
  };

  // Cards
  card_collection: {
    id: string;
    character_id: string;
    cards: {
      id: string;
      quantity: number;
    }[];
  };

  // Decks
  decks: {
    id: string;
    character_id: string;
    name: string;
    identity_card: string;
    cards: string[];
    created_at: string;
    updated_at: string;
  };

  // Game world data
  world_state: {
    id: string;
    user_id: string;
    territories: {
      id: string;
      influence_level: number;
      controlled_by: string;
      mission_available: boolean;
      security_level: number;
    }[];
    global_events: string[];
    turn_count: number;
  };

  // Saved games
  saved_games: {
    id: string;
    user_id: string;
    character_id: string;
    save_name: string;
    save_data: any;
    created_at: string;
    screenshot_url?: string;
  };

  // Mission data
  missions: {
    id: string;
    name: string;
    description: string;
    territory_id: string;
    difficulty: number;
    rewards: {
      credits: number;
      items?: string[];
      influence?: number;
      experience?: number;
    };
    prerequisites?: {
      min_level?: number;
      missions_completed?: string[];
      faction_reputation?: { [faction: string]: number };
    };
    is_story_mission: boolean;
    mission_type: string;
  };

  // Game content (for admin management)
  content_cards: {
    id: string;
    name: string;
    card_type: string;
    faction: string;
    cost: number;
    text: string;
    effects: any[];
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };

  content_gear: {
    id: string;
    name: string;
    gear_type: string;
    rarity: string;
    level_requirement: number;
    effects: any[];
    stats: { [key: string]: number };
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };

  content_events: {
    id: string;
    name: string;
    description: string;
    event_type: string;
    effects: any[];
    duration: number;
    conditions: any[];
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };

  content_territories: {
    id: string;
    name: string;
    description: string;
    territory_type: string;
    base_security: number;
    base_resources: number;
    coordinates: { q: number; r: number };
    connections: string[];
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };

  // Settings and preferences
  user_settings: {
    id: string;
    user_id: string;
    game_settings: {
      difficulty: string;
      audio_enabled: boolean;
      music_volume: number;
      sfx_volume: number;
      show_tutorials: boolean;
      auto_save: boolean;
      language: string;
    };
    display_settings: {
      resolution: string;
      fullscreen: boolean;
      show_fps: boolean;
      graphics_quality: string;
      ui_scale: number;
    };
    accessibility_settings: {
      high_contrast: boolean;
      large_text: boolean;
      reduced_motion: boolean;
      colorblind_mode: string;
      screen_reader_enabled: boolean;
    };
    last_updated: string;
  };

  // Achievements
  achievements: {
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    progress?: number;
  };
}
