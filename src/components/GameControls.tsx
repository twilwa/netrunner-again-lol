import React, { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useGame } from '../context/GameContext';
import GameMenu from './GameMenu';

interface GameControlsProps {
  onEndTurn: () => void;
  onDrawCard: () => void;
  turnCount: number;
  gamePhase: string;
  clicksRemaining: number;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onEndTurn, 
  onDrawCard,
  turnCount,
  gamePhase,
  clicksRemaining
}) => {
  const { state } = useGame();
  const [showMenu, setShowMenu] = useState(false);
  
  // Format the phase name for display
  const formatPhase = (phase: string) => {
    return phase.split('_')[0].charAt(0) + phase.split('_')[0].slice(1).toLowerCase();
  };

  return (
    <>
      <div className="cyber-panel p-4">
        <h3 className="text-lg font-bold mb-2 text-center cyber-glow">GAME CONTROLS</h3>
        
        <div className="text-center mb-4">
          <div className="text-sm font-cyber">TURN {turnCount}</div>
          <div className="text-xs text-gray-300">PHASE: {formatPhase(gamePhase)}</div>
          {gamePhase === 'ACTION_PHASE' && (
            <div className="text-xs text-cyan-400 mt-1">Clicks: {clicksRemaining}</div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {gamePhase === 'ACTION_PHASE' && clicksRemaining > 0 && (
            <button 
              className="cyber-btn font-cyber text-center"
              onClick={onDrawCard}
            >
              DRAW CARD (1 CLICK)
            </button>
          )}
          
          <button 
            className="cyber-btn font-cyber text-center"
            onClick={onEndTurn}
          >
            END {gamePhase.split('_')[0]} PHASE
          </button>
          
          {state.activeMission && (
            <button 
              className="cyber-btn font-cyber text-center mt-2"
              onClick={() => window.location.href = '/overworld'}
            >
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                <span>EXIT MISSION</span>
              </div>
            </button>
          )}
          
          <button 
            className="cyber-btn font-cyber text-center mt-2"
            onClick={() => setShowMenu(true)}
          >
            <div className="flex items-center justify-center gap-2">
              <Menu size={16} />
              <span>GAME MENU</span>
            </div>
          </button>
        </div>
      </div>
      
      {showMenu && <GameMenu onClose={() => setShowMenu(false)} />}
    </>
  );
};

export default GameControls;
