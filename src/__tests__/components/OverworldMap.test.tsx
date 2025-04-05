import React from 'react';
import { render, screen, fireEvent } from '../helpers/testUtils';
import OverworldMap from '../../components/OverworldMap';
import { GameProvider } from '../../context/GameContext';
import { generateTestGameState } from '../helpers/testUtils';

jest.mock('../../components/TerritoryHex', () => ({ 
  __esModule: true, 
  default: ({ onClick, territory }: any) => (
    <div 
      data-testid={`territory-${territory.id}`}
      onClick={onClick}
    >
      {territory.name}
    </div>
  )
}));

jest.mock('../../components/GameNotifications', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="game-notifications" />
}));

jest.mock('../../components/TurnPhaseBar', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="turn-phase-bar" />
}));

describe('OverworldMap Component', () => {
  test('renders correctly with territories', () => {
    render(<OverworldMap />);
    
    // Check for major components
    expect(screen.getByTestId('game-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('turn-phase-bar')).toBeInTheDocument();
    
    // Check for the map title
    expect(screen.getByText(/NIGHT CITY - DISTRICT MAP/i)).toBeInTheDocument();
    
    // Check for territory statistics section
    expect(screen.getByText(/TERRITORY CONTROL/i)).toBeInTheDocument();
    expect(screen.getByText(/Runner/i)).toBeInTheDocument();
    expect(screen.getByText(/Corp/i)).toBeInTheDocument();
    expect(screen.getByText(/Neutral/i)).toBeInTheDocument();
    
    // Check for the player stats section
    expect(screen.getByText(/RUNNER STATS/i)).toBeInTheDocument();
    expect(screen.getByText(/Credits/i)).toBeInTheDocument();
    expect(screen.getByText(/Influence/i)).toBeInTheDocument();
    expect(screen.getByText(/Actions/i)).toBeInTheDocument();
    
    // Check for the cards section
    expect(screen.getByText(/OVERWORLD CARDS/i)).toBeInTheDocument();
    expect(screen.getByText(/DRAW CARD/i)).toBeInTheDocument();
    
    // Check for zoom controls
    expect(screen.getByTitle(/Zoom Out/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Zoom In/i)).toBeInTheDocument();
  });
  
  test('handles territory selection', () => {
    const testState = generateTestGameState();
    
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <GameProvider initialState={testState}>
        {children}
      </GameProvider>
    );
    
    render(<OverworldMap />, { wrapper: TestWrapper });
    
    // Find a territory and click it
    const territory = screen.getByTestId('territory-test-territory-1');
    fireEvent.click(territory);
    
    // After clicking, the territory details panel should appear
    expect(screen.getByText(/Test Downtown/i)).toBeInTheDocument();
    expect(screen.getByText(/Type: corporate/i)).toBeInTheDocument();
    
    // Should have a close button
    const closeButton = screen.getByText(/Close/i);
    fireEvent.click(closeButton);
    
    // Territory panel should disappear
    expect(screen.queryByText(/Test Downtown/i)).not.toBeInTheDocument();
  });
  
  test('displays accurate territory control statistics', () => {
    const testState = generateTestGameState({
      territories: [
        {
          id: 'runner-territory',
          name: 'Runner Base',
          type: 'slums',
          coord: { q: -1, r: 1 },
          influenceLevel: 20,
          controlledBy: 'runner',
        },
        {
          id: 'corp-territory',
          name: 'Corp HQ',
          type: 'corporate',
          coord: { q: 1, r: -1 },
          influenceLevel: 80,
          controlledBy: 'corp',
        },
        {
          id: 'neutral-territory',
          name: 'Neutral Zone',
          type: 'fringe',
          coord: { q: 0, r: 0 },
          influenceLevel: 50,
          controlledBy: 'neutral',
        }
      ]
    });
    
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <GameProvider initialState={testState}>
        {children}
      </GameProvider>
    );
    
    render(<OverworldMap />, { wrapper: TestWrapper });
    
    // The territory control section should show 1 of each type
    const territoryCounts = screen.getAllByText(/1/);
    expect(territoryCounts.length).toBeGreaterThan(0);
    
    // Total should be 3
    expect(screen.getByText(/Total/i).nextSibling).toHaveTextContent('3');
  });
  
  test('handles overworld card drawing', () => {
    const testState = generateTestGameState({
      gamePhase: 'ACTION_PHASE',
      clicksRemaining: 5,
      overworldHand: []
    });
    
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <GameProvider initialState={testState}>
        {children}
      </GameProvider>
    );
    
    render(<OverworldMap />, { wrapper: TestWrapper });
    
    // Initially should show no cards
    expect(screen.getByText(/No cards in hand/i)).toBeInTheDocument();
    
    // Click draw card button
    fireEvent.click(screen.getByText(/DRAW CARD/i));
    
    // The "No cards in hand" message should no longer be present
    expect(screen.queryByText(/No cards in hand/i)).not.toBeInTheDocument();
  });
  
  test('handles end phase button', () => {
    const testState = generateTestGameState({
      gamePhase: 'ACTION_PHASE',
      clicksRemaining: 5
    });
    
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <GameProvider initialState={testState}>
        {children}
      </GameProvider>
    );
    
    render(<OverworldMap />, { wrapper: TestWrapper });
    
    // Check that the end phase button shows the correct phase
    expect(screen.getByText(/END ACTION PHASE/i)).toBeInTheDocument();
    
    // Click the end phase button
    fireEvent.click(screen.getByText(/END ACTION PHASE/i));
    
    // The game phase should change (this is harder to test directly)
    // But we can verify the button text changes
    expect(screen.queryByText(/END ACTION PHASE/i)).not.toBeInTheDocument();
    expect(screen.getByText(/END RESOLUTION PHASE/i)).toBeInTheDocument();
  });
});
