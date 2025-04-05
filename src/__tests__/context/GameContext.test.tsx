import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameProvider, useGame } from '../../context/GameContext';

// Test component that uses the game context
const TestComponent = () => {
  const { state, dispatch } = useGame();
  
  return (
    <div>
      <div data-testid="player-health">{state.player.health}</div>
      <div data-testid="player-energy">{state.player.energy}</div>
      <div data-testid="player-credits">{state.playerCredits}</div>
      <div data-testid="phase">{state.gamePhase}</div>
      <div data-testid="turn">{state.turnCount}</div>
      <div data-testid="clicks">{state.clicksRemaining}</div>
      <div data-testid="hand-size">{state.playerHand.length}</div>
      
      <button 
        data-testid="draw-card" 
        onClick={() => dispatch({ type: 'DRAW_CARD' })}
      >
        Draw Card
      </button>
      
      <button 
        data-testid="end-phase" 
        onClick={() => dispatch({ type: 'END_TURN' })}
      >
        End Phase
      </button>
      
      <button 
        data-testid="update-credits" 
        onClick={() => dispatch({ type: 'UPDATE_CREDITS', amount: 10 })}
      >
        Add Credits
      </button>
      
      <button 
        data-testid="add-notification" 
        onClick={() => dispatch({ type: 'ADD_NOTIFICATION', message: 'Test notification' })}
      >
        Add Notification
      </button>
    </div>
  );
};

describe('GameContext', () => {
  test('initializes with default state', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );
    
    // Check initial values
    expect(screen.getByTestId('player-health')).toHaveTextContent('30');
    expect(screen.getByTestId('player-energy')).toHaveTextContent('5');
    expect(screen.getByTestId('player-credits')).toHaveTextContent('20');
    expect(screen.getByTestId('phase')).toHaveTextContent('UPKEEP_PHASE');
    expect(screen.getByTestId('turn')).toHaveTextContent('1');
    expect(screen.getByTestId('clicks')).toHaveTextContent('5');
  });
  
  test('draws a card when action dispatched', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );
    
    // Wait for initial setup to complete
    act(() => {
      // Move to action phase
      fireEvent.click(screen.getByTestId('end-phase'));
    });
    
    const initialHandSize = Number(screen.getByTestId('hand-size').textContent);
    const initialClicks = Number(screen.getByTestId('clicks').textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('draw-card'));
    });
    
    const newHandSize = Number(screen.getByTestId('hand-size').textContent);
    const newClicks = Number(screen.getByTestId('clicks').textContent);
    
    // Hand size should increase by 1
    expect(newHandSize).toBe(initialHandSize + 1);
    // Clicks should decrease by 1
    expect(newClicks).toBe(initialClicks - 1);
  });
  
  test('cycles through game phases', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );
    
    // Initial phase should be UPKEEP_PHASE
    expect(screen.getByTestId('phase')).toHaveTextContent('UPKEEP_PHASE');
    
    // End upkeep phase, should move to ACTION_PHASE
    act(() => {
      fireEvent.click(screen.getByTestId('end-phase'));
    });
    expect(screen.getByTestId('phase')).toHaveTextContent('ACTION_PHASE');
    
    // End action phase, should move to RESOLUTION_PHASE
    act(() => {
      fireEvent.click(screen.getByTestId('end-phase'));
    });
    expect(screen.getByTestId('phase')).toHaveTextContent('RESOLUTION_PHASE');
    
    // End resolution phase, should move to next turn's UPKEEP_PHASE
    act(() => {
      fireEvent.click(screen.getByTestId('end-phase'));
    });
    expect(screen.getByTestId('phase')).toHaveTextContent('UPKEEP_PHASE');
    expect(screen.getByTestId('turn')).toHaveTextContent('2');
  });
  
  test('updates credits', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );
    
    const initialCredits = Number(screen.getByTestId('player-credits').textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('update-credits'));
    });
    
    const newCredits = Number(screen.getByTestId('player-credits').textContent);
    expect(newCredits).toBe(initialCredits + 10);
  });
  
  test('handles various action types correctly', () => {
    const { rerender } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );
    
    // Test the initial draw
    const initialHandSize = Number(screen.getByTestId('hand-size').textContent);
    expect(initialHandSize).toBeGreaterThan(0);
    
    // Test resource generation in upkeep phase
    const initialCredits = Number(screen.getByTestId('player-credits').textContent);
    
    // Complete a full turn cycle
    act(() => {
      fireEvent.click(screen.getByTestId('end-phase')); // to ACTION_PHASE
      fireEvent.click(screen.getByTestId('end-phase')); // to RESOLUTION_PHASE
      fireEvent.click(screen.getByTestId('end-phase')); // to next turn's UPKEEP_PHASE
    });
    
    // Energy should be reset to max
    expect(screen.getByTestId('player-energy')).toHaveTextContent('5');
    
    // Clicks should be reset to max
    expect(screen.getByTestId('clicks')).toHaveTextContent('5');
    
    // Turn should increment
    expect(screen.getByTestId('turn')).toHaveTextContent('2');
  });
});
