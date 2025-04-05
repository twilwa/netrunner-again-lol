import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Card, Player, Enemy, HexTile, Territory } from '../types';
import { generateInitialCards, generateHexGrid, generateTerritories } from '../utils/generators';

interface GameState {
  player: Player;
  enemies: Enemy[];
  playerDeck: Card[];
  playerHand: Card[];
  playerDiscard: Card[];
  playerCredits: number;
  playerInfluencePoints: number;
  activeCard: Card | null;
  hexGrid: HexTile[];
  territories: Territory[];
  turnCount: number;
  gamePhase: 'UPKEEP_PHASE' | 'ACTION_PHASE' | 'RESOLUTION_PHASE' | 'ENEMY_TURN' | 'GAME_OVER';
  activeMission: string | null;
  clicksRemaining: number;
  maxClicks: number;
  selectedTerritory: string | null;
  selectedTacticalHex: { q: number; r: number } | null;
  playerFaction: 'runner' | 'corp';
  notifications: string[];
  pendingActions: any[]; // Store actions queued during action phase
  marketplaceCards: Card[]; // Storefront cards for the marketplace
  overworldHand: Card[]; // Cards for the overworld map
}

type GameAction =
  | { type: 'DRAW_CARD' }
  | { type: 'DRAW_OVERWORLD_CARD' }
  | { type: 'PLAY_CARD'; card: Card }
  | { type: 'CANCEL_CARD' }
  | { type: 'SET_ACTIVE_CARD'; card: Card | null }
  | { type: 'MOVE_PLAYER'; destination: { q: number; r: number } }
  | { type: 'END_TURN' }
  | { type: 'UPDATE_CREDITS'; amount: number }
  | { type: 'UPDATE_TERRITORY_INFLUENCE'; territoryId: string; amount: number; faction: 'runner' | 'corp' }
  | { type: 'START_MISSION'; territoryId: string }
  | { type: 'SELECT_TERRITORY'; territoryId: string | null }
  | { type: 'SELECT_TACTICAL_HEX'; coord: { q: number; r: number } | null }
  | { type: 'BASIC_MOVE'; destination: { q: number; r: number } }
  | { type: 'BASIC_ATTACK'; target: string }
  | { type: 'INTERACT'; objectId: string }
  | { type: 'QUEUE_ACTION'; action: any }
  | { type: 'EXECUTE_PENDING_ACTIONS' }
  | { type: 'UPKEEP_PHASE' }
  | { type: 'ACTION_PHASE' }
  | { type: 'RESOLUTION_PHASE' }
  | { type: 'ADD_CARD_TO_DECK'; card: Card }
  | { type: 'ADD_NOTIFICATION'; message: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'RESET_GAME' };

const initialCards = generateInitialCards();
const initialHexGrid = generateHexGrid(5);
const initialTerritories = generateTerritories();

// Generate a diverse set of cards for the marketplace
const generateMarketplaceCards = (): Card[] => {
  const baseCards = [
    // RUNNER faction cards
    {
      id: 'mk-card-1',
      name: 'Neural Spike',
      cost: 2,
      type: 'attack',
      faction: 'RUNNER',
      description: 'Deal 5 damage directly to a targeted system.',
      effect: (state) => state,
      range: 2,
      damage: 5
    },
    {
      id: 'mk-card-2',
      name: 'Ghost Runner',
      cost: 1,
      type: 'resource',
      faction: 'RUNNER',
      description: 'Place 3 credits on this card. Use these credits during runs.',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 3
      })
    },
    {
      id: 'mk-card-3',
      name: 'Stealth Protocol',
      cost: 2,
      type: 'skill',
      faction: 'RUNNER',
      description: 'Avoid the next encountered ICE.',
      effect: (state) => state
    },
    // CRIMINAL faction cards
    {
      id: 'mk-card-4',
      name: 'Emergency Shutdown',
      cost: 0,
      type: 'hack',
      faction: 'CRIMINAL',
      description: 'Deactivate a piece of ICE that you passed during this run.',
      effect: (state) => state,
      influenceCost: 2
    },
    {
      id: 'mk-card-5',
      name: 'Infiltration',
      cost: 0,
      type: 'resource',
      faction: 'CRIMINAL',
      description: 'Gain 2 credits or expose a card.',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 2
      }),
      influenceCost: 1
    },
    {
      id: 'mk-card-6',
      name: 'Sneakdoor Beta',
      cost: 3,
      type: 'hack',
      faction: 'CRIMINAL',
      description: 'Access a server through an alternate entrance.',
      effect: (state) => state,
      influenceCost: 3
    },
    // ANARCH faction cards
    {
      id: 'mk-card-7',
      name: 'Demolition Run',
      cost: 2,
      type: 'attack',
      faction: 'ANARCH',
      description: 'Trash the first card accessed at no cost.',
      effect: (state) => state,
      damage: 4,
      influenceCost: 2
    },
    {
      id: 'mk-card-8',
      name: 'Imp',
      cost: 2,
      type: 'skill',
      faction: 'ANARCH',
      description: 'Place 2 virus counters on Imp when installed. Trash accessed cards at no cost.',
      effect: (state) => state,
      influenceCost: 2
    },
    {
      id: 'mk-card-9',
      name: 'Medium',
      cost: 3,
      type: 'hack',
      faction: 'ANARCH',
      description: 'Access additional cards from R&D during successful runs.',
      effect: (state) => state,
      influenceCost: 3
    },
    // SHAPER faction cards
    {
      id: 'mk-card-10',
      name: 'Modded',
      cost: 0,
      type: 'resource',
      faction: 'SHAPER',
      description: 'Install a program or piece of hardware, lowering the cost by 3.',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 3
      }),
      influenceCost: 1
    },
    {
      id: 'mk-card-11',
      name: 'The Maker\'s Eye',
      cost: 1,
      type: 'hack',
      faction: 'SHAPER',
      description: 'Access 2 additional cards when running R&D.',
      effect: (state) => state,
      influenceCost: 2
    },
    {
      id: 'mk-card-12',
      name: 'The Personal Touch',
      cost: 2,
      type: 'skill',
      faction: 'SHAPER',
      description: 'Give an icebreaker +1 strength.',
      effect: (state) => state,
      influenceCost: 2
    },
    // NEUTRAL faction cards
    {
      id: 'mk-card-13',
      name: 'Sure Gamble',
      cost: 3,
      type: 'resource',
      faction: 'NEUTRAL',
      description: 'Gain 9 credits.',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 9
      })
    },
    {
      id: 'mk-card-14',
      name: 'Dirty Laundry',
      cost: 2,
      type: 'resource',
      faction: 'NEUTRAL',
      description: 'Make a successful run. If successful, gain 5 credits.',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 5
      })
    },
    // Move cards
    {
      id: 'mk-card-15',
      name: 'Tactical Dash',
      cost: 1,
      type: 'move',
      faction: 'RUNNER',
      description: 'Move up to 4 hexes.',
      effect: (state) => state,
      range: 4
    },
    {
      id: 'mk-card-16',
      name: 'Ghost Walk',
      cost: 2,
      type: 'move',
      faction: 'CRIMINAL',
      description: 'Move through enemy-controlled hexes freely for one turn.',
      effect: (state) => state,
      range: 3,
      influenceCost: 1
    },
    {
      id: 'mk-card-17',
      name: 'Strategic Positioning',
      cost: 1,
      type: 'move',
      faction: 'NEUTRAL',
      description: 'Move up to 2 hexes and draw a card.',
      effect: (state) => state,
      range: 2
    },
    // More attack cards
    {
      id: 'mk-card-18',
      name: 'Sniper Shot',
      cost: 3,
      type: 'attack',
      faction: 'CRIMINAL',
      description: 'Attack a target up to 4 hexes away for 6 damage.',
      effect: (state) => state,
      range: 4,
      damage: 6,
      influenceCost: 2
    },
    {
      id: 'mk-card-19',
      name: 'Explosive Charge',
      cost: 2,
      type: 'attack',
      faction: 'ANARCH',
      description: 'Deal 4 damage to all targets in a 1-hex radius.',
      effect: (state) => state,
      range: 2,
      damage: 4,
      influenceCost: 2
    },
    {
      id: 'mk-card-20',
      name: 'Precision Strike',
      cost: 1,
      type: 'attack',
      faction: 'SHAPER',
      description: 'Deal 3 damage and reduce target defenses by 1.',
      effect: (state) => state,
      range: 2,
      damage: 3,
      influenceCost: 1
    }
  ];
  
  // Add more cards as needed
  return baseCards.sort(() => Math.random() - 0.5);
};

// Generate initial overworld cards
const generateOverworldCards = (): Card[] => {
  return [
    {
      id: 'ow-card-1',
      name: 'Digital Infiltration',
      cost: 2,
      type: 'hack',
      faction: 'RUNNER',
      description: 'Reduce corporate influence in a territory by 10%',
      effect: (state) => state
    },
    {
      id: 'ow-card-2',
      name: 'Resource Generation',
      cost: 1,
      type: 'resource',
      faction: 'RUNNER',
      description: 'Generate 5 credits immediately',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 5
      })
    },
    {
      id: 'ow-card-3',
      name: 'Runner Network',
      cost: 2,
      type: 'skill',
      faction: 'RUNNER',
      description: 'Establish runner influence in a territory',
      effect: (state) => state
    }
  ];
};

const initialState: GameState = {
  player: {
    id: 'player',
    name: 'Runner',
    position: { q: 0, r: 0 },
    health: 30,
    maxHealth: 30,
    energy: 5,
    maxEnergy: 5,
  },
  enemies: [
    {
      id: 'corp-1',
      name: 'Corp Agent',
      position: { q: 2, r: -2 },
      health: 15,
      maxHealth: 15,
    },
  ],
  playerDeck: initialCards,
  playerHand: [],
  playerDiscard: [],
  playerCredits: 20,
  playerInfluencePoints: 5,
  activeCard: null,
  hexGrid: initialHexGrid,
  territories: initialTerritories,
  turnCount: 1,
  gamePhase: 'UPKEEP_PHASE',
  activeMission: null,
  clicksRemaining: 5, // Changed from 3 to 5 per request
  maxClicks: 5, // Changed from 3 to 5 per request
  selectedTerritory: null,
  selectedTacticalHex: null,
  playerFaction: 'runner',
  notifications: [],
  pendingActions: [],
  marketplaceCards: generateMarketplaceCards(),
  overworldHand: generateOverworldCards() // Initialize overworldHand with some starting cards
};

function drawCards(state: GameState, count: number): GameState {
  if (state.playerDeck.length === 0) {
    // Reshuffle discard into deck if empty
    if (state.playerDiscard.length === 0) {
      return {
        ...state,
        notifications: [...state.notifications, "No cards left to draw!"]
      }; // Can't draw any more cards
    }
    
    const newDeck = [...state.playerDiscard].sort(() => Math.random() - 0.5);
    return {
      ...state,
      playerDeck: newDeck,
      playerDiscard: [],
      notifications: [...state.notifications, "Reshuffled discard pile into deck!"]
    };
  }

  const actualCount = Math.min(count, state.playerDeck.length);
  const newHand = [...state.playerHand, ...state.playerDeck.slice(0, actualCount)];
  const newDeck = state.playerDeck.slice(actualCount);

  return {
    ...state,
    playerHand: newHand,
    playerDeck: newDeck,
    notifications: [...state.notifications, `Drew ${actualCount} card${actualCount !== 1 ? 's' : ''}!`]
  };
}

// Draw an overworld card
function drawOverworldCard(state: GameState): GameState {
  // Basic implementation - in a real game, you'd have a dedicated overworld deck
  const newCard = {
    id: `ow-card-${Date.now()}`,
    name: ['Digital Infiltration', 'Resource Generation', 'Security Bypass', 'Network Control'][Math.floor(Math.random() * 4)],
    cost: Math.floor(Math.random() * 3) + 1,
    type: ['hack', 'resource', 'skill'][Math.floor(Math.random() * 3)],
    faction: 'RUNNER',
    description: 'Overworld card effect',
    effect: (state: any) => state
  };
  
  return {
    ...state,
    overworldHand: [...(state.overworldHand || []), newCard],
    clicksRemaining: state.clicksRemaining - 1,
    notifications: [...state.notifications, `Drew overworld card: ${newCard.name}`]
  };
}

// Calculate resources gained from territory control
function calculateResourceGain(territories: Territory[], faction: 'runner' | 'corp'): number {
  let credits = 0;
  
  territories.forEach(territory => {
    if (territory.controlledBy === faction) {
      // Base income is 2 credits per controlled territory
      let territoryIncome = 2;
      
      // Higher influence provides bonus income
      if (faction === 'runner' && territory.influenceLevel <= 30) {
        territoryIncome += 1; // Strong runner control provides bonus
      } else if (faction === 'corp' && territory.influenceLevel >= 70) {
        territoryIncome += 1; // Strong corp control provides bonus
      }
      
      // Territory types provide different incomes
      if (territory.type === 'corporate') {
        territoryIncome += faction === 'corp' ? 2 : 0;
      } else if (territory.type === 'slums') {
        territoryIncome += faction === 'runner' ? 1 : 0;
      }
      
      credits += territoryIncome;
    } else if (territory.controlledBy === 'neutral') {
      // Even neutral territories provide some income if you have influence
      if ((faction === 'runner' && territory.influenceLevel < 50) || 
          (faction === 'corp' && territory.influenceLevel > 50)) {
        credits += 1;
      }
    }
  });
  
  return credits;
}

function updateTerritoryControl(territories: Territory[]): Territory[] {
  return territories.map(territory => {
    let controlledBy: 'runner' | 'corp' | 'neutral';
    
    if (territory.influenceLevel >= 60) {
      controlledBy = 'corp';
    } else if (territory.influenceLevel <= 40) {
      controlledBy = 'runner';
    } else {
      controlledBy = 'neutral';
    }
    
    return {
      ...territory,
      controlledBy
    };
  });
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DRAW_CARD':
      // Can only draw cards during action phase and costs a click
      if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot draw cards now!"]
        };
      }
      
      const newState = drawCards(state, 1);
      return {
        ...newState,
        clicksRemaining: state.clicksRemaining - 1
      };
      
    case 'DRAW_OVERWORLD_CARD':
      // Can only draw cards during action phase and costs a click
      if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot draw cards now!"]
        };
      }
      
      return drawOverworldCard(state);

    case 'PLAY_CARD':
      if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot play cards now!"]
        };
      }
      
      if (state.player.energy < action.card.cost) {
        return {
          ...state,
          notifications: [...state.notifications, "Not enough energy to play this card!"]
        };
      }
      
      // Execute card effect
      let effectResult = state;
      if (action.card.effect) {
        try {
          effectResult = action.card.effect(state);
        } catch (error) {
          console.error("Error executing card effect:", error);
        }
      }
      
      return {
        ...effectResult,
        playerHand: effectResult.playerHand.filter(card => card.id !== action.card.id),
        playerDiscard: [...effectResult.playerDiscard, action.card],
        player: {
          ...effectResult.player,
          energy: effectResult.player.energy - action.card.cost,
        },
        activeCard: null,
        clicksRemaining: effectResult.clicksRemaining - 1,
        pendingActions: [...effectResult.pendingActions, { type: 'CARD_PLAYED', card: action.card }],
        notifications: [...effectResult.notifications, `Played ${action.card.name}!`]
      };

    case 'CANCEL_CARD':
      // Just clear the active card, don't discard it
      return {
        ...state,
        activeCard: null
      };

    case 'SET_ACTIVE_CARD':
      if (state.gamePhase !== 'ACTION_PHASE' && action.card !== null) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot select cards now!"]
        };
      }
      
      return {
        ...state,
        activeCard: action.card,
      };

    case 'MOVE_PLAYER':
      if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot move now!"]
        };
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          position: action.destination,
        },
        activeCard: null,
        clicksRemaining: state.clicksRemaining - 1,
        pendingActions: [...state.pendingActions, { type: 'PLAYER_MOVED', destination: action.destination }],
        notifications: [...state.notifications, "Moved to new position"]
      };

    case 'BASIC_MOVE':
      if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot move now!"]
        };
      }
      
      // Basic move costs 1 click and has a range limit of 1
      const currentPosition = state.player.position;
      const distance = Math.max(
        Math.abs(currentPosition.q - action.destination.q),
        Math.abs(currentPosition.r - action.destination.r),
        Math.abs(-currentPosition.q - currentPosition.r - (-action.destination.q - action.destination.r))
      );
      
      if (distance > 1) {
        return {
          ...state,
          notifications: [...state.notifications, "Basic move can only go 1 hex!"]
        };
      }
      
      return {
        ...state,
        player: {
          ...state.player,
          position: action.destination,
        },
        clicksRemaining: state.clicksRemaining - 1,
        pendingActions: [...state.pendingActions, { type: 'BASIC_MOVED', destination: action.destination }],
        notifications: [...state.notifications, "Made a basic move"]
      };
      
    case 'BASIC_ATTACK':
      if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot attack now!"]
        };
      }
      
      // Find target enemy
      const targetEnemy = state.enemies.find(enemy => enemy.id === action.target);
      if (!targetEnemy) {
        return {
          ...state,
          notifications: [...state.notifications, "Invalid target!"]
        };
      }
      
      // Check if enemy is adjacent
      const playerPos = state.player.position;
      const enemyPos = targetEnemy.position;
      const attackDistance = Math.max(
        Math.abs(playerPos.q - enemyPos.q),
        Math.abs(playerPos.r - enemyPos.r),
        Math.abs(-playerPos.q - playerPos.r - (-enemyPos.q - enemyPos.r))
      );
      
      if (attackDistance > 1) {
        return {
          ...state,
          notifications: [...state.notifications, "Target is out of range for basic attack!"]
        };
      }
      
      // Apply basic attack damage (2)
      const updatedEnemies = state.enemies.map(enemy => {
        if (enemy.id === action.target) {
          return {
            ...enemy,
            health: Math.max(0, enemy.health - 2)
          };
        }
        return enemy;
      });
      
      return {
        ...state,
        enemies: updatedEnemies,
        clicksRemaining: state.clicksRemaining - 1,
        pendingActions: [...state.pendingActions, { type: 'BASIC_ATTACK', target: action.target, damage: 2 }],
        notifications: [...state.notifications, `Basic attack on ${targetEnemy.name} for 2 damage!`]
      };
      
    case 'INTERACT':
      if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot interact now!"]
        };
      }
      
      // Implement interaction logic here
      return {
        ...state,
        clicksRemaining: state.clicksRemaining - 1,
        pendingActions: [...state.pendingActions, { type: 'INTERACTED', objectId: action.objectId }],
        notifications: [...state.notifications, `Interacted with object ${action.objectId}`]
      };

    case 'END_TURN':
      // Progress to the next phase
      if (state.gamePhase === 'UPKEEP_PHASE') {
        return {
          ...state,
          gamePhase: 'ACTION_PHASE',
          notifications: [...state.notifications, "Action Phase begun! Queue up your actions."]
        };
      } else if (state.gamePhase === 'ACTION_PHASE') {
        return {
          ...state,
          gamePhase: 'RESOLUTION_PHASE',
          notifications: [...state.notifications, "Resolution Phase begun! Executing your actions."]
        };
      } else {
        // End of turn, reset for new turn
        return {
          ...state,
          turnCount: state.turnCount + 1,
          gamePhase: 'UPKEEP_PHASE',
          clicksRemaining: state.maxClicks,
          pendingActions: [], // Clear pending actions
          player: {
            ...state.player,
            energy: state.player.maxEnergy,
          },
          notifications: [...state.notifications, `Turn ${state.turnCount} ended. Beginning Turn ${state.turnCount + 1}!`]
        };
      }

    case 'UPKEEP_PHASE':
      // Resource generation from territory control
      const creditsGained = calculateResourceGain(state.territories, state.playerFaction);
      
      return {
        ...state,
        playerCredits: state.playerCredits + creditsGained,
        notifications: [...state.notifications, `Upkeep Phase: Gained ${creditsGained} credits from territories`]
      };
      
    case 'ACTION_PHASE':
      return {
        ...state,
        notifications: [...state.notifications, "Action Phase: Take your actions"]
      };
      
    case 'RESOLUTION_PHASE':
      // End of turn resolutions - territory control updates, ongoing effects
      const updatedTerritories = updateTerritoryControl(state.territories);
      
      // Here we would execute all the pending actions in order
      // For now we'll just log them
      if (state.pendingActions.length > 0) {
        console.log("Executing pending actions:", state.pendingActions);
      }
      
      return {
        ...state,
        territories: updatedTerritories,
        notifications: [...state.notifications, "Resolution Phase: Executing queued actions and updating territory control"]
      };

    case 'UPDATE_CREDITS':
      return {
        ...state,
        playerCredits: state.playerCredits + action.amount,
        notifications: [...state.notifications, `${action.amount >= 0 ? 'Gained' : 'Spent'} ${Math.abs(action.amount)} credits`]
      };
      
    case 'UPDATE_TERRITORY_INFLUENCE':
      const territoryUpdates = state.territories.map(territory => {
        if (territory.id === action.territoryId) {
          // If runner action, decrease influence level (corp control)
          // If corp action, increase influence level
          let newInfluence;
          if (action.faction === 'runner') {
            newInfluence = Math.max(0, territory.influenceLevel + action.amount);
          } else {
            newInfluence = Math.min(100, territory.influenceLevel + action.amount);
          }
          
          return {
            ...territory,
            influenceLevel: newInfluence
          };
        }
        return territory;
      });
      
      // Update territory control based on influence levels
      const territoriesWithUpdatedControl = updateTerritoryControl(territoryUpdates);
      
      return {
        ...state,
        territories: territoriesWithUpdatedControl,
        notifications: [...state.notifications, `Territory influence changed in ${action.territoryId}`]
      };
      
    case 'START_MISSION':
      const territory = state.territories.find(t => t.id === action.territoryId);
      if (!territory) {
        return {
          ...state,
          notifications: [...state.notifications, "Invalid territory selected for mission"]
        };
      }
      
      // Determine enemy difficulty based on influence level
      const securityLevel = Math.floor(territory.influenceLevel / 20) + 1; // 1-5 scale
      
      // Generate enemies based on territory type and security level
      const missionEnemies = [];
      for (let i = 0; i < securityLevel; i++) {
        missionEnemies.push({
          id: `corp-${i+1}`,
          name: i === 0 ? 'Corp Officer' : 'Security Guard',
          position: { 
            q: Math.floor(Math.random() * 5) - 2, 
            r: Math.floor(Math.random() * 5) - 2 
          },
          health: 10 + (securityLevel * 2),
          maxHealth: 10 + (securityLevel * 2),
        });
      }
      
      // Set up the mission state
      return {
        ...state,
        activeMission: action.territoryId,
        // Reset player energy and position for new mission
        player: {
          ...state.player,
          energy: state.player.maxEnergy,
          position: { q: 0, r: 0 }, // Start position for mission
        },
        // Set generated enemies
        enemies: missionEnemies,
        gamePhase: 'ACTION_PHASE',
        clicksRemaining: state.maxClicks,
        pendingActions: [], // Clear pending actions for new mission
        notifications: [...state.notifications, `Mission started in ${territory.name}`]
      };
      
    case 'SELECT_TERRITORY':
      return {
        ...state,
        selectedTerritory: action.territoryId
      };
      
    case 'SELECT_TACTICAL_HEX':
      return {
        ...state,
        selectedTacticalHex: action.coord
      };
      
    case 'ADD_CARD_TO_DECK':
      return {
        ...state,
        playerDeck: [...state.playerDeck, action.card],
        notifications: [...state.notifications, `Added ${action.card.name} to your deck`]
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.message, ...state.notifications].slice(0, 10) // Keep only last 10 notifications
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Initialize player's hand on first render
  React.useEffect(() => {
    // Draw initial hand
    dispatch({ type: 'DRAW_CARD' });
    dispatch({ type: 'DRAW_CARD' });
    dispatch({ type: 'DRAW_CARD' });
    dispatch({ type: 'DRAW_CARD' });
    dispatch({ type: 'DRAW_CARD' });
    
    // Process upkeep phase for first turn
    dispatch({ type: 'UPKEEP_PHASE' });
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
