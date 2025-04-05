import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { GameProvider, useGame } from '../src/context/GameContext';
import { GamePhase, Card, HexCoord } from '../src/types';

// Mock components for testing
const TestHand = () => {
  const { state } = useGame();
  return (
    <div data-testid="hand">
      {state.playerHand.map(card => (
        <div key={card.id} data-testid={`card-${card.id}`}>
          {card.name}
        </div>
      ))}
    </div>
  );
};

const TestActions = () => {
  const { state, dispatch } = useGame();
  return (
    <div>
      <div data-testid="phase">{state.gamePhase}</div>
      <div data-testid="clicks">{state.clicksRemaining}</div>
      <button 
        data-testid="draw-card"
        onClick={() => dispatch({ type: 'DRAW_CARD' })}
      >
        Draw Card
      </button>
      <button 
        data-testid="end-turn"
        onClick={() => dispatch({ type: 'END_TURN' })}
      >
        End Turn
      </button>
      {state.playerHand.length > 0 && (
        <button 
          data-testid="play-card"
          onClick={() => dispatch({ 
            type: 'SET_ACTIVE_CARD', 
            card: state.playerHand[0] 
          })}
        >
          Select Card
        </button>
      )}
      {state.activeCard && (
        <div data-testid="active-card">{state.activeCard.name}</div>
      )}
    </div>
  );
};

const TestMove = () => {
  const { state, dispatch } = useGame();
  const destination: HexCoord = { q: 1, r: -1 };
  
  return (
    <div>
      <div data-testid="player-position">
        {state.player.position.q},{state.player.position.r}
      </div>
      <button 
        data-testid="move-player"
        onClick={() => dispatch({ 
          type: 'MOVE_PLAYER', 
          destination 
        })}
      >
        Move Player
      </button>
    </div>
  );
};

describe('GameContext', () => {
  // Test initial state
  it('should initialize with default state', () => {
    render(
      <GameProvider>
        <TestActions />
      </GameProvider>
    );
    
    expect(screen.getByTestId('phase')).toHaveTextContent('UPKEEP_PHASE');
    expect(screen.getByTestId('clicks')).toHaveTextContent('5');
  });
  
  // Test drawing cards
  it('should allow drawing cards during ACTION_PHASE', async () => {
    render(
      <GameProvider>
        <TestHand />
        <TestActions />
      </GameProvider>
    );
    
    // Move to action phase
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });
    
    expect(screen.getByTestId('phase')).toHaveTextContent('ACTION_PHASE');
    
    // Get initial hand size
    const initialHandSize = screen.getByTestId('hand').childElementCount;
    
    // Draw a card
    await act(async () => {
      fireEvent.click(screen.getByTestId('draw-card'));
    });
    
    // Verify hand size increased
    expect(screen.getByTestId('hand').childElementCount).toBe(initialHandSize + 1);
    
    // Verify click was spent
    expect(screen.getByTestId('clicks')).toHaveTextContent('4');
  });
  
  // Test setting active card
  it('should allow selecting a card', async () => {
    render(
      <GameProvider>
        <TestHand />
        <TestActions />
      </GameProvider>
    );
    
    // Move to action phase
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });
    
    // Draw a card if hand is empty
    if (!screen.queryByTestId('play-card')) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('draw-card'));
      });
    }
    
    // Select a card
    await act(async () => {
      fireEvent.click(screen.getByTestId('play-card'));
    });
    
    // Verify card is selected
    expect(screen.getByTestId('active-card')).toBeInTheDocument();
  });
  
  // Test player movement
  it('should allow moving the player during ACTION_PHASE', async () => {
    render(
      <GameProvider>
        <TestMove />
        <TestActions />
      </GameProvider>
    );
    
    // Get initial position
    const initialPosition = screen.getByTestId('player-position').textContent;
    
    // Move to action phase
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });
    
    // Move player
    await act(async () => {
      fireEvent.click(screen.getByTestId('move-player'));
    });
    
    // Verify position changed
    expect(screen.getByTestId('player-position').textContent).not.toBe(initialPosition);
    expect(screen.getByTestId('player-position').textContent).toBe('1,-1');
  });
  
  // Test turn phases progression
  it('should progress through game phases correctly', async () => {
    render(
      <GameProvider>
        <TestActions />
      </GameProvider>
    );
    
    // Start in UPKEEP_PHASE
    expect(screen.getByTestId('phase')).toHaveTextContent('UPKEEP_PHASE');
    
    // First end turn -> ACTION_PHASE
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });
    expect(screen.getByTestId('phase')).toHaveTextContent('ACTION_PHASE');
    
    // Second end turn -> RESOLUTION_PHASE
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });
    expect(screen.getByTestId('phase')).toHaveTextContent('RESOLUTION_PHASE');
    
    // Third end turn -> back to UPKEEP_PHASE
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });
    expect(screen.getByTestId('phase')).toHaveTextContent('UPKEEP_PHASE');
  });
  
  // Test click system
  it('should reset clicks at the start of a new turn', async () => {
    render(
      <GameProvider>
        <TestActions />
      </GameProvider>
    );
    
    // Move to action phase
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn'));
    });
    
    // Spend some clicks
    await act(async () => {
      fireEvent.click(screen.getByTestId('draw-card'));
      fireEvent.click(screen.getByTestId('draw-card'));
    });
    
    expect(screen.getByTestId('clicks')).toHaveTextContent('3');
    
    // Complete the turn
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-turn')); // To RESOLUTION_PHASE
      fireEvent.click(screen.getByTestId('end-turn')); // Back to UPKEEP_PHASE
    });
    
    // Verify clicks reset to max
    expect(screen.getByTestId('clicks')).toHaveTextContent('5');
  });
  
  // Test action restrictions
  it('should prevent drawing cards outside ACTION_PHASE', async () => {
    render(
      <GameProvider>
        <TestHand />
        <TestActions />
      </GameProvider>
    );
    
    // Should be in UPKEEP_PHASE initially
    expect(screen.getByTestId('phase')).toHaveTextContent('UPKEEP_PHASE');
    
    // Get initial hand size
    const initialHandSize = screen.getByTestId('hand').childElementCount;
    
    // Try to draw a card
    await act(async () => {
      fireEvent.click(screen.getByTestId('draw-card'));
    });
    
    // Verify hand size didn't change
    expect(screen.getByTestId('hand').childElementCount).toBe(initialHandSize);
  });
});
