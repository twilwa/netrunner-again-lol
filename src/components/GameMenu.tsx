import React from 'react';
import { CircleHelp, LogOut, Save, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';

interface GameMenuProps {
  onClose: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onClose }) => {
  const { state } = useGame();
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex items-center justify-center">
      <div className="cyber-panel p-6 w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold cyber-glow">GAME MENU</h2>
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-3">
          <Link 
            to="/overworld" 
            className="cyber-btn font-cyber text-center block"
            onClick={onClose}
          >
            <div className="flex items-center gap-2">
              <LogOut size={18} />
              <span>RETURN TO OVERWORLD</span>
            </div>
          </Link>
          
          {!state.activeMission && (
            <Link 
              to="/territory-select" 
              className="cyber-btn font-cyber text-center block"
              onClick={onClose}
            >
              <div className="flex items-center gap-2">
                <Settings size={18} />
                <span>DEPLOY TO MISSION</span>
              </div>
            </Link>
          )}
          
          <button className="cyber-btn font-cyber text-center w-full block">
            <div className="flex items-center gap-2">
              <Save size={18} />
              <span>SAVE GAME</span>
            </div>
          </button>
          
          <button className="cyber-btn font-cyber text-center w-full block">
            <div className="flex items-center gap-2">
              <CircleHelp size={18} />
              <span>HELP & TUTORIAL</span>
            </div>
          </button>
          
          <div className="pt-4 border-t border-gray-700 mt-4">
            <div className="text-sm text-gray-400 mb-2">Current Status:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Territories Controlled:</div>
              <div className="text-right">{state.territories.filter(t => t.controlledBy === 'runner').length}</div>
              
              <div>Credits:</div>
              <div className="text-right text-yellow-400">{state.playerCredits}¢</div>
              
              <div>Current Mission:</div>
              <div className="text-right">
                {state.activeMission ? 
                  state.territories.find(t => t.id === state.activeMission)?.name : 
                  'None'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
