import React from 'react';

interface TurnPhaseBarProps {
  currentPhase: string;
  turnCount: number;
  clicksRemaining: number;
}

const TurnPhaseBar: React.FC<TurnPhaseBarProps> = ({ 
  currentPhase,
  turnCount,
  clicksRemaining
}) => {
  // Map phases to step numbers
  const phaseToStep = {
    'UPKEEP_PHASE': 1,
    'ACTION_PHASE': 2,
    'RESOLUTION_PHASE': 3,
    'ENEMY_TURN': 4,
    'GAME_OVER': 5
  };

  const currentStep = phaseToStep[currentPhase as keyof typeof phaseToStep] || 1;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-gray-900 bg-opacity-90 border-b border-cyan-800 shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="font-cyber text-sm">
            TURN {turnCount}
          </div>
          
          <div className="flex-1 mx-8">
            <div className="flex justify-between items-center">
              <div className={`text-xs ${currentStep >= 1 ? 'text-cyan-400' : 'text-gray-500'}`}>
                UPKEEP
              </div>
              <div className={`text-xs ${currentStep >= 2 ? 'text-cyan-400' : 'text-gray-500'}`}>
                ACTION
              </div>
              <div className={`text-xs ${currentStep >= 3 ? 'text-cyan-400' : 'text-gray-500'}`}>
                RESOLUTION
              </div>
            </div>
            
            <div className="w-full h-1 bg-gray-800 mt-1 relative">
              <div 
                className="h-full bg-cyan-500"
                style={{ width: `${(currentStep - 1) * 50}%` }}
              ></div>
              <div 
                className="absolute h-3 w-3 rounded-full bg-cyan-400 top-1/2 transform -translate-y-1/2 -translate-x-1/2 border-2 border-gray-800"
                style={{ left: `${(currentStep - 1) * 50}%` }}
              ></div>
            </div>
          </div>
          
          {currentPhase === 'ACTION_PHASE' && (
            <div className="font-cyber text-sm flex items-center">
              <span className="text-gray-400 mr-2">CLICKS:</span>
              <span className="text-cyan-400">{clicksRemaining}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurnPhaseBar;
