import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from '../../context/GameContext';

// Custom wrapper that provides common context providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <GameProvider>
        {children}
      </GameProvider>
    </BrowserRouter>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Generate a basic game state for testing
export const generateTestGameState = (overrides = {}) => {
  return {
    player: {
      id: 'test-player',
      name: 'Test Runner',
      position: { q: 0, r: 0 },
      health: 30,
      maxHealth: 30,
      energy: 5,
      maxEnergy: 5,
    },
    enemies: [
      {
        id: 'test-enemy-1',
        name: 'Test Enemy',
        position: { q: 2, r: -2 },
        health: 15,
        maxHealth: 15,
      },
    ],
    playerDeck: [
      {
        id: 'test-card-1',
        name: 'Test Move',
        cost: 1,
        type: 'move',
        faction: 'RUNNER',
        description: 'Test movement card',
        effect: (state: any) => state,
        range: 3,
      },
      {
        id: 'test-card-2',
        name: 'Test Attack',
        cost: 2,
        type: 'attack',
        faction: 'RUNNER',
        description: 'Test attack card',
        effect: (state: any) => state,
        damage: 3,
        range: 2,
      },
    ],
    playerHand: [],
    playerDiscard: [],
    playerCredits: 20,
    playerInfluencePoints: 5,
    activeCard: null,
    hexGrid: Array.from({ length: 25 }, (_, i) => {
      const q = Math.floor(i / 5) - 2;
      const r = (i % 5) - 2;
      return {
        id: `${q},${r}`,
        coord: { q, r },
        type: 'normal',
        elevation: 0,
        influenceLevel: 50,
      };
    }),
    territories: [
      {
        id: 'test-territory-1',
        name: 'Test Downtown',
        type: 'corporate',
        coord: { q: 0, r: 0 },
        influenceLevel: 50,
        controlledBy: 'neutral',
        mission: true,
      },
      {
        id: 'test-territory-2',
        name: 'Test Slums',
        type: 'slums',
        coord: { q: -1, r: 1 },
        influenceLevel: 30,
        controlledBy: 'runner',
        mission: true,
      },
    ],
    turnCount: 1,
    gamePhase: 'ACTION_PHASE',
    activeMission: null,
    clicksRemaining: 5,
    maxClicks: 5,
    selectedTerritory: null,
    selectedTacticalHex: null,
    playerFaction: 'runner',
    notifications: [],
    pendingActions: [],
    marketplaceCards: [],
    overworldHand: [],
    ...overrides,
  };
};

// Re-export everything from RTL
export * from '@testing-library/react';
export { customRender as render };
