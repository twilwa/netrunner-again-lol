import React from 'react';
import { render, screen } from '../helpers/testUtils';
import TacticalView from '../../components/TacticalView';
import { generateTestGameState } from '../helpers/testUtils';
import { GameProvider } from '../../context/GameContext';

// Mock the Canvas and 3D components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="camera" />,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Sky: () => <div data-testid="sky" />,
  useTexture: jest.fn(() => ({})),
  Environment: () => <div data-testid="environment" />,
  ContactShadows: () => <div data-testid="contact-shadows" />,
}));

jest.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bloom: () => <div data-testid="bloom" />,
  Vignette: () => <div data-testid="vignette" />,
}));

jest.mock('../../components/HexGrid', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="hex-grid" />
}));

jest.mock('../../components/CardHand', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="card-hand" />
}));

jest.mock('../../components/PlayerStats', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="player-stats" />
}));

jest.mock('../../components/GameControls', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="game-controls" />
}));

jest.mock('../../components/TurnPhaseBar', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="turn-phase-bar" />
}));

jest.mock('../../components/GameNotifications', () => ({ 
  __esModule: true, 
  default: () => <div data-testid="game-notifications" />
}));

describe('TacticalView Component', () => {
  beforeEach(() => {
    // Mock the setTimeout for the loading screen
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders the component with all required subcomponents', () => {
    render(<TacticalView />);
    
    // Initially it shows the loading screen
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    // Main components
    expect(screen.getByTestId('turn-phase-bar')).toBeInTheDocument();
    expect(screen.getByTestId('game-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('hex-grid')).toBeInTheDocument();
    expect(screen.getByTestId('card-hand')).toBeInTheDocument();
    expect(screen.getByTestId('player-stats')).toBeInTheDocument();
    expect(screen.getByTestId('game-controls')).toBeInTheDocument();
    
    // 3D components
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    expect(screen.getByTestId('camera')).toBeInTheDocument();
    expect(screen.getByTestId('sky')).toBeInTheDocument();
    
    // The focus player button should be present
    expect(screen.getByText(/Focus Player/i)).toBeInTheDocument();
  });

  test('displays mission banner when a mission is active', () => {
    // Create a test state with an active mission
    const testState = generateTestGameState({
      activeMission: 'test-territory-1',
      territories: [
        {
          id: 'test-territory-1',
          name: 'Test Mission Territory',
          type: 'corporate',
          coord: { q: 0, r: 0 },
          influenceLevel: 50,
          controlledBy: 'neutral',
          mission: true,
        }
      ]
    });
    
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <GameProvider initialState={testState}>
        {children}
      </GameProvider>
    );
    
    render(<TacticalView />, { wrapper: TestWrapper });
    
    // Verify mission banner is displayed
    expect(screen.getByText(/ACTIVE MISSION/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Mission Territory/i)).toBeInTheDocument();
  });
});
