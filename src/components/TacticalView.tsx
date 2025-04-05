import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Sky, useTexture, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import HexGrid from './HexGrid';
import CardHand from './CardHand';
import PlayerStats from './PlayerStats';
import GameControls from './GameControls';
import TurnPhaseBar from './TurnPhaseBar';
import GameNotifications from './GameNotifications';
import { useGame } from '../context/GameContext';
import { getHexDistance, getHexesInRange, areHexCoordsEqual, findHexByCoord } from '../utils/hexUtils';
import { HexCoord } from '../types';
import LoadingScreen from './LoadingScreen';

const TacticalView: React.FC = () => {
  const { state, dispatch } = useGame();
  const [highlightedHexes, setHighlightedHexes] = useState<HexCoord[]>([]);
  const [cameraPosition, setCameraPosition] = useState([0, 10, 12]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle hex click
  const handleHexClick = (coord: HexCoord) => {
    const hex = findHexByCoord(state.hexGrid, coord);
    if (!hex || hex.type === 'blocked') return;

    // If active card selected, apply its effect
    if (state.activeCard) {
      const distance = getHexDistance(state.player.position, coord);
      
      if (state.activeCard.type === 'move') {
        if (distance <= state.activeCard.range!) {
          dispatch({ type: 'MOVE_PLAYER', destination: coord });
          dispatch({ type: 'PLAY_CARD', card: state.activeCard });
        }
      } else if (state.activeCard.type === 'attack') {
        // Check if any enemy is at this position
        const targetEnemy = state.enemies.find(enemy => 
          areHexCoordsEqual(enemy.position, coord)
        );
        
        if (targetEnemy && distance <= state.activeCard.range!) {
          // In a real game, we'd damage the enemy here
          dispatch({ type: 'ADD_NOTIFICATION', message: `Attacking ${targetEnemy.name} for ${state.activeCard.damage} damage` });
          dispatch({ type: 'PLAY_CARD', card: state.activeCard });
        }
      } else {
        // Handle other card types
        if (distance <= (state.activeCard.range || 1)) {
          dispatch({ type: 'ADD_NOTIFICATION', message: `Using ${state.activeCard.name} effect at position ${coord.q},${coord.r}` });
          dispatch({ type: 'PLAY_CARD', card: state.activeCard });
        }
      }
    } else {
      dispatch({ type: 'SELECT_TACTICAL_HEX', coord });
    }
  };

  // Update highlighted hexes based on active card
  useEffect(() => {
    if (state.activeCard && state.activeCard.range) {
      const range = state.activeCard.range;
      setHighlightedHexes(getHexesInRange(state.player.position, range));
    } else {
      setHighlightedHexes([]);
    }
  }, [state.activeCard, state.player.position]);

  // Function to end the current phase and move to the next
  const handleEndPhase = () => {
    dispatch({ type: 'END_TURN' });
  };

  // Camera control functions
  const handleFocusOnPlayer = () => {
    const [x, _, z] = getHexPosition(state.player.position);
    setCameraPosition([x, 10, z + 8]);
  };

  // Simulate loading complete after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Get hex position (copying from hexUtils to avoid circular dependencies)
  function getHexPosition(coord: HexCoord, size: number = 1): [number, number, number] {
    const x = size * (3/2 * coord.q);
    const z = size * (Math.sqrt(3)/2 * coord.q + Math.sqrt(3) * coord.r);
    return [x, 0, z];
  }

  return (
    <div className="relative h-screen w-screen">
      {/* Turn Phase Bar */}
      <TurnPhaseBar 
        currentPhase={state.gamePhase} 
        turnCount={state.turnCount}
        clicksRemaining={state.clicksRemaining}
      />

      {/* Mission banner if active */}
      {state.activeMission && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-gray-800 border border-cyan-500 px-4 py-2 rounded-md shadow-lg">
          <div className="text-center">
            <div className="text-xs text-gray-400">ACTIVE MISSION</div>
            <div className="text-lg font-bold text-cyan-400">
              {state.territories.find(t => t.id === state.activeMission)?.name || 'Unknown Location'}
            </div>
          </div>
        </div>
      )}

      {/* Game Notifications */}
      <GameNotifications notifications={state.notifications} />
      
      {/* Focus on player button */}
      <button 
        className="absolute top-24 right-4 z-10 cyber-btn font-cyber px-2 py-1 text-sm"
        onClick={handleFocusOnPlayer}
      >
        Focus Player
      </button>

      {/* 3D Canvas with HexGrid */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={cameraPosition} />
        
        <color attach="background" args={['#0a0a0f']} />
        
        {/* Advanced Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[10, 15, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#5ce1e6" />
        
        {/* Fog effect */}
        <fog attach="fog" args={['#0a0a0f', 15, 35]} />
        
        <Suspense fallback={null}>
          <Environment preset="night" />
          
          {/* Main Hex Grid */}
          <HexGrid 
            hexes={state.hexGrid} 
            player={state.player}
            enemies={state.enemies}
            onHexClick={handleHexClick}
            highlightedHexes={highlightedHexes}
            selectedHex={state.selectedTacticalHex}
          />
          
          {/* Ground plane with texture */}
          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.6}
            scale={40}
            blur={1}
            far={10}
            resolution={256}
            color="#000000"
          />
        </Suspense>
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
            opacity={0.8}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
        
        <OrbitControls 
          target={[
            state.player.position.q * 1.5, 
            0, 
            state.player.position.q * 0.866 + state.player.position.r * 1.732
          ]}
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2.5}
          enablePan={true}
          enableZoom={true}
          dampingFactor={0.05}
        />
        <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <PlayerStats 
              health={state.player.health} 
              maxHealth={state.player.maxHealth}
              energy={state.player.energy}
              maxEnergy={state.player.maxEnergy}
              credits={state.playerCredits}
              influence={state.playerInfluencePoints}
              clicks={state.clicksRemaining}
              maxClicks={state.maxClicks}
            />
          </div>
          
          <div className="col-span-6">
            <CardHand 
              cards={state.playerHand} 
              onCardClick={(card) => dispatch({ type: 'SET_ACTIVE_CARD', card })}
              onCardDiscard={() => dispatch({ type: 'CANCEL_CARD' })}
              activeCard={state.activeCard}
              playerEnergy={state.player.energy}
            />
          </div>
          
          <div className="col-span-3">
            <GameControls 
              onEndTurn={handleEndPhase}
              onDrawCard={() => dispatch({ type: 'DRAW_CARD' })}
              turnCount={state.turnCount}
              gamePhase={state.gamePhase}
              clicksRemaining={state.clicksRemaining}
            />
          </div>
        </div>
      </div>
      
      {/* Loading overlay */}
      {isLoading && <LoadingScreen />}
    </div>
  );
};

export default TacticalView;
