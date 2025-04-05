import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Card, Player, Enemy, HexTile, Territory, GamePhase, ActionType, QueuedAction } from '../types';
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
  gamePhase: GamePhase;
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
  actionQueue: QueuedAction[]; // New queue for action phase
  hoveredHex: { q: number; r: number } | null; // Track hovered hex for targeting
  activeAction: ActionType | null; // Currently selected basic action
}

type GameAction =
  | { type: 'DRAW_CARD' }
  | { type: 'DRAW_OVERWORLD_CARD' }
  | { type: 'PLAY_CARD'; card: Card; target?: { q: number; r: number } }
  | { type: 'CANCEL_CARD' }
  | { type: 'SET_ACTIVE_CARD'; card: Card | null }
  | { type: 'SET_ACTIVE_ACTION'; action: ActionType | null }
  | { type: 'MOVE_PLAYER'; destination: { q: number; r: number } }
  | { type: 'END_TURN' }
  | { type: 'UPDATE_CREDITS'; amount: number }
  | { type: 'UPDATE_TERRITORY_INFLUENCE'; territoryId: string; amount: number; faction: 'runner' | 'corp' }
  | { type: 'START_MISSION'; territoryId: string }
  | { type: 'SELECT_TERRITORY'; territoryId: string | null }
  | { type: 'SELECT_TACTICAL_HEX'; coord: { q: number; r: number } | null }
  | { type: 'HOVER_HEX'; coord: { q: number; r: number } | null }
  | { type: 'BASIC_MOVE'; destination: { q: number; r: number } }
  | { type: 'BASIC_ATTACK'; target: string }
  | { type: 'INTERACT'; objectId: string }
  | { type: 'QUEUE_ACTION'; action: QueuedAction }
  | { type: 'REMOVE_QUEUED_ACTION'; actionId: string }
  | { type: 'REORDER_QUEUE'; fromIndex: number; toIndex: number }
  | { type: 'EXECUTE_ACTION_QUEUE' }
  | { type: 'CLEAR_ACTION_QUEUE' }
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
  gamePhase: GamePhase.UPKEEP,
  activeMission: null,
  clicksRemaining: 5,
  maxClicks: 5,
  selectedTerritory: null,
  selectedTacticalHex: null,
  playerFaction: 'runner',
  notifications: [],
  pendingActions: [],
  marketplaceCards: generateMarketplaceCards(),
  overworldHand: generateOverworldCards(),
  actionQueue: [], // Initialize empty action queue
  hoveredHex: null, // For highlighting interactions
  activeAction: null // For basic actions
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

// Execute a queued action and apply its effects
function executeQueuedAction(state: GameState, action: QueuedAction): GameState {
  let newState = { ...state };
  
  switch (action.type) {
    case ActionType.PLAY_CARD:
      if (action.card) {
        // Apply card effect
        if (action.card.effect) {
          try {
            newState = action.card.effect(newState);
          } catch (error) {
            console.error("Error executing card effect:", error);
          }
        }
        
        newState = {
          ...newState,
          playerHand: newState.playerHand.filter(c => c.id !== action.card!.id),
          playerDiscard: [...newState.playerDiscard, action.card],
          player: {
            ...newState.player,
            energy: newState.player.energy - action.card.cost
          },
          notifications: [...newState.notifications, `Executed: ${action.card.name}`]
        };
      }
      break;
      
    case ActionType.BASIC_MOVE:
      if (action.target) {
        newState = {
          ...newState,
          player: {
            ...newState.player,
            position: action.target as HexCoord
          },
          notifications: [...newState.notifications, `Executed: Move to (${(action.target as HexCoord).q}, ${(action.target as HexCoord).r})`]
        };
      }
      break;
      
    case ActionType.BASIC_ATTACK:
      if (action.target) {
        // Find the enemy to attack
        const targetId = action.target as string;
        const updatedEnemies = newState.enemies.map(enemy => {
          if (enemy.id === targetId) {
            return {
              ...enemy,
              health: Math.max(0, enemy.health - 2) // Basic attack does 2 damage
            };
          }
          return enemy;
        });
        
        newState = {
          ...newState,
          enemies: updatedEnemies,
          notifications: [...newState.notifications, `Executed: Attack on ${targetId} for 2 damage`]
        };
      }
      break;
      
    case ActionType.INTERACT:
      if (action.target) {
        newState = {
          ...newState,
          notifications: [...newState.notifications, `Executed: Interact with ${action.target}`]
        };
      }
      break;
      
    case ActionType.DRAW_CARD:
      newState = drawCards(newState, 1);
      break;
  }
  
  return newState;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DRAW_CARD':
      // If we're in action phase, queue the draw card action
      if (state.gamePhase === GamePhase.ACTION && state.clicksRemaining > 0) {
        const queuedAction: QueuedAction = {
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: ActionType.DRAW_CARD,
          cost: 0, // Drawing cards costs 0 energy
          clickCost: 1, // but costs 1 click
          description: "Draw 1 card"
        };
        
        return {
          ...state,
          actionQueue: [...state.actionQueue, queuedAction],
          clicksRemaining: state.clicksRemaining - 1
        };
      } else if (state.gamePhase !== GamePhase.ACTION) {
        return {
          ...state,
          notifications: [...state.notifications, "Can only queue actions during the Action phase!"]
        };
      } else {
        return {
          ...state,
          notifications: [...state.notifications, "Not enough clicks remaining!"]
        };
      }
      
    case 'DRAW_OVERWORLD_CARD':
      // Can only draw cards during action phase and costs a click
      if (state.gamePhase !== GamePhase.ACTION || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot draw cards now!"]
        };
      }
      
      return drawOverworldCard(state);

    case 'PLAY_CARD':
      if (state.gamePhase !== GamePhase.ACTION || state.clicksRemaining <= 0) {
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
      
      // Queue card action instead of executing immediately
      const cardAction: QueuedAction = {
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: ActionType.PLAY_CARD,
        card: action.card,
        target: action.target,
        cost: action.card.cost,
        clickCost: 1,
        description: `Play ${action.card.name}${action.target ? ` at (${action.target.q}, ${action.target.r})` : ''}`
      };
      
      return {
        ...state,
        activeCard: null,
        clicksRemaining: state.clicksRemaining - 1,
        actionQueue: [...state.actionQueue, cardAction],
        notifications: [...state.notifications, `Queued: ${action.card.name}`]
      };

    case 'CANCEL_CARD':
      // Just clear the active card, don't discard it
      return {
        ...state,
        activeCard: null
      };

    case 'SET_ACTIVE_CARD':
      if (state.gamePhase !== GamePhase.ACTION && action.card !== null) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot select cards now!"]
        };
      }
      
      return {
        ...state,
        activeCard: action.card,
        activeAction: null // Clear active action when selecting a card
      };
      
    case 'SET_ACTIVE_ACTION':
      if (state.gamePhase !== GamePhase.ACTION && action.action !== null) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot select actions now!"]
        };
      }
      
      return {
        ...state,
        activeAction: action.action,
        activeCard: null // Clear active card when selecting a basic action
      };

    case 'MOVE_PLAYER':
      if (state.gamePhase !== GamePhase.ACTION || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot move now!"]
        };
      }
      
      // Queue move action instead of executing immediately
      const moveAction: QueuedAction = {
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: ActionType.BASIC_MOVE,
        target: action.destination,
        cost: 0, // Basic moves cost 0 energy
        clickCost: 1, // but cost 1 click
        description: `Move to (${action.destination.q}, ${action.destination.r})`
      };
      
      return {
        ...state,
        activeCard: null,
        activeAction: null,
        clicksRemaining: state.clicksRemaining - 1,
        actionQueue: [...state.actionQueue, moveAction],
        notifications: [...state.notifications, `Queued: Move to (${action.destination.q}, ${action.destination.r})`]
      };

    case 'BASIC_MOVE':
      if (state.gamePhase !== GamePhase.ACTION || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot move now!"]
        };
      }
      
      // Queue basic move action
      const basicMoveAction: QueuedAction = {
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: ActionType.BASIC_MOVE,
        target: action.destination,
        cost: 0,
        clickCost: 1,
        description: `Basic move to (${action.destination.q}, ${action.destination.r})`
      };
      
      return {
        ...state,
        activeAction: null,
        clicksRemaining: state.clicksRemaining - 1,
        actionQueue: [...state.actionQueue, basicMoveAction],
        notifications: [...state.notifications, `Queued: Basic move to (${action.destination.q}, ${action.destination.r})`]
      };
      
    case 'BASIC_ATTACK':
      if (state.gamePhase !== GamePhase.ACTION || state.clicksRemaining <= 0) {
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
      
      // Queue basic attack action
      const basicAttackAction: QueuedAction = {
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: ActionType.BASIC_ATTACK,
        target: action.target,
        cost: 0,
        clickCost: 1,
        description: `Basic attack on ${targetEnemy.name}`
      };
      
      return {
        ...state,
        activeAction: null,
        clicksRemaining: state.clicksRemaining - 1,
        actionQueue: [...state.actionQueue, basicAttackAction],
        notifications: [...state.notifications, `Queued: Attack on ${targetEnemy.name}`]
      };
      
    case 'INTERACT':
      if (state.gamePhase !== GamePhase.ACTION || state.clicksRemaining <= 0) {
        return {
          ...state,
          notifications: [...state.notifications, "Cannot interact now!"]
        };
      }
      
      // Queue interaction action
      const interactAction: QueuedAction = {
        id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: ActionType.INTERACT,
        target: action.objectId,
        cost: 0,
        clickCost: 1,
        description: `Interact with object ${action.objectId}`
      };
      
      return {
        ...state,
        activeAction: null,
        clicksRemaining: state.clicksRemaining - 1,
        actionQueue: [...state.actionQueue, interactAction],
        notifications: [...state.notifications, `Queued: Interaction with ${action.objectId}`]
      };

    case 'QUEUE_ACTION':
      if (state.gamePhase !== GamePhase.ACTION) {
        return {
          ...state,
          notifications: [...state.notifications, "Can only queue actions during the Action phase!"]
        };
      }
      
      // Check if player has enough clicks
      if (state.clicksRemaining < action.action.clickCost) {
        return {
          ...state,
          notifications: [...state.notifications, "Not enough clicks remaining!"]
        };
      }
      
      return {
        ...state,
        actionQueue: [...state.actionQueue, action.action],
        clicksRemaining: state.clicksRemaining - action.action.clickCost,
        notifications: [...state.notifications, `Queued: ${action.action.description}`]
      };
      
    case 'REMOVE_QUEUED_ACTION':
      // Find the action to remove
      const actionToRemove = state.actionQueue.find(a => a.id === action.actionId);
      if (!actionToRemove) {
        return state;
      }
      
      return {
        ...state,
        actionQueue: state.actionQueue.filter(a => a.id !== action.actionId),
        clicksRemaining: state.clicksRemaining + actionToRemove.clickCost, // Refund the clicks
        notifications: [...state.notifications, `Removed action from queue: ${actionToRemove.description}`]
      };
      
    case 'REORDER_QUEUE':
      // Move an action from one position to another
      const newQueue = [...state.actionQueue];
      const [movedAction] = newQueue.splice(action.fromIndex, 1);
      newQueue.splice(action.toIndex, 0, movedAction);
      
      return {
        ...state,
        actionQueue: newQueue,
        notifications: [...state.notifications, "Reordered action queue"]
      };
      
    case 'EXECUTE_ACTION_QUEUE':
      if (state.gamePhase !== GamePhase.RESOLUTION) {
        return {
          ...state,
          notifications: [...state.notifications, "Actions can only be executed during the Resolution phase!"]
        };
      }
      
      if (state.actionQueue.length === 0) {
        return {
          ...state,
          notifications: [...state.notifications, "No actions in queue to execute!"]
        };
      }
      
      // Execute each action in order
      let updatedState = { ...state };
      for (const action of state.actionQueue) {
        updatedState = executeQueuedAction(updatedState, action);
      }
      
      return {
        ...updatedState,
        actionQueue: [], // Clear the queue after execution
        notifications: [...updatedState.notifications, "All queued actions executed!"]
      };
      
    case 'CLEAR_ACTION_QUEUE':
      return {
        ...state,
        actionQueue: [],
        clicksRemaining: state.maxClicks, // Refund all clicks
        notifications: [...state.notifications, "Action queue cleared!"]
      };

    case 'END_TURN':
      // Progress to the next phase
      if (state.gamePhase === GamePhase.UPKEEP) {
        return {
          ...state,
          gamePhase: GamePhase.ACTION,
          notifications: [...state.notifications, "Action Phase begun! Queue up your actions."]
        };
      } else if (state.gamePhase === GamePhase.ACTION) {
        return {
          ...state,
          gamePhase: GamePhase.RESOLUTION,
          notifications: [...state.notifications, "Resolution Phase begun! Executing your actions."]
        };
      } else if (state.gamePhase === GamePhase.RESOLUTION) {
        // Execute all queued actions if any remain
        let updatedState = { ...state };
        if (updatedState.actionQueue.length > 0) {
          for (const queuedAction of updatedState.actionQueue) {
            updatedState = executeQueuedAction(updatedState, queuedAction);
          }
          updatedState.actionQueue = [];
        }
        
        // Move to next turn
        return {
          ...updatedState,
          turnCount: updatedState.turnCount + 1,
          gamePhase: GamePhase.UPKEEP,
          clicksRemaining: updatedState.maxClicks,
          pendingActions: [], // Clear pending actions
          player: {
            ...updatedState.player,
            energy: updatedState.player.maxEnergy,
          },
          notifications: [...updatedState.notifications, `Turn ${updatedState.turnCount} ended. Beginning Turn ${updatedState.turnCount + 1}!`]
        };
      } else {
        // End of turn, reset for new turn
        return {
          ...state,
          turnCount: state.turnCount + 1,
          gamePhase: GamePhase.UPKEEP,
          clicksRemaining: state.maxClicks,
          pendingActions: [], // Clear pending actions
          actionQueue: [], // Clear action queue
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
        notifications: [...state.notifications, "Action Phase: Queue your actions"]
      };
      
    case 'RESOLUTION_PHASE':
      // Execute all queued actions
      let updatedState = { ...state };
      for (const queuedAction of updatedState.actionQueue) {
        updatedState = executeQueuedAction(updatedState, queuedAction);
      }
      
      // End of turn resolutions - territory control updates, ongoing effects
      const updatedTerritories = updateTerritoryControl(updatedState.territories);
      
      return {
        ...updatedState,
        actionQueue: [], // Clear the queue after execution
        territories: updatedTerritories,
        notifications: [...updatedState.notifications, "Resolution Phase: Executed all queued actions"]
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
        gamePhase: GamePhase.ACTION,
        clicksRemaining: state.maxClicks,
        actionQueue: [], // Clear action queue for new mission
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
      
    case 'HOVER_HEX':
      return {
        ...state,
        hoveredHex: action.coord
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
