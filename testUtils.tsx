import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from '../src/context/GameContext';
import { SupabaseProvider } from '../src/context/SupabaseContext';
import { mockSupabase } from './mockSupabase';

// Extended render options interface with custom properties
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withGameContext?: boolean;
  withSupabase?: boolean;
  initialGameState?: any;
}

/**
 * Custom render function that allows wrapping components with providers
 */
function customRender(
  ui: ReactElement,
  {
    withRouter = true,
    withGameContext = true,
    withSupabase = true,
    initialGameState,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    // Start with the component itself
    let wrappedComponent = <>{children}</>;

    // Optionally wrap with GameProvider
    if (withGameContext) {
      wrappedComponent = (
        <GameProvider initialState={initialGameState}>
          {wrappedComponent}
        </GameProvider>
      );
    }

    // Optionally wrap with SupabaseProvider
    if (withSupabase) {
      wrappedComponent = (
        <SupabaseProvider supabaseClient={mockSupabase}>
          {wrappedComponent}
        </SupabaseProvider>
      );
    }

    // Optionally wrap with router
    if (withRouter) {
      wrappedComponent = (
        <BrowserRouter>
          {wrappedComponent}
        </BrowserRouter>
      );
    }

    return wrappedComponent;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Reexport everything from testing-library
export * from '@testing-library/react';

// Export custom render method
export { customRender as render };

/**
 * Mock game state generator for tests
 */
export function generateMockGameState(overrides = {}) {
  return {
    player: {
      id: 'player-test',
      name: 'Test Runner',
      position: { q: 0, r: 0 },
      health: 30,
      maxHealth: 30,
      energy: 5,
      maxEnergy: 5,
    },
    enemies: [
      {
        id: 'enemy-test-1',
        name: 'Test Enemy',
        position: { q: 2, r: -2 },
        health: 15,
        maxHealth: 15,
      },
    ],
    playerDeck: [],
    playerHand: [],
    playerDiscard: [],
    playerCredits: 20,
    playerInfluencePoints: 5,
    activeCard: null,
    hexGrid: [],
    territories: [],
    turnCount: 1,
    gamePhase: 'UPKEEP_PHASE',
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
    ...overrides
  };
}

/**
 * Mock hex grid generator for tests
 */
export function generateMockHexGrid(radius = 2) {
  const grid = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    
    for (let r = r1; r <= r2; r++) {
      grid.push({
        id: `${q},${r}`,
        coord: { q, r },
        type: 'normal',
        elevation: 0,
        influenceLevel: 50
      });
    }
  }
  return grid;
}

/**
 * Mock territory generator for tests
 */
export function generateMockTerritories(count = 3) {
  const types = ['corporate', 'slums', 'fringe', 'neutral'];
  const territories = [];
  
  for (let i = 0; i < count; i++) {
    territories.push({
      id: `territory-${i}`,
      name: `Test Territory ${i}`,
      type: types[i % types.length],
      coord: { q: i - 1, r: -i },
      influenceLevel: 50,
      controlledBy: 'neutral',
      mission: i % 2 === 0
    });
  }
  
  return territories;
}
