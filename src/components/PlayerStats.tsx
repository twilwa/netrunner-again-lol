import React from 'react';

interface PlayerStatsProps {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  credits: number;
  influence: number;
  clicks: number;
  maxClicks: number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ 
  health, 
  maxHealth, 
  energy, 
  maxEnergy,
  credits,
  influence,
  clicks,
  maxClicks
}) => {
  // Calculate percentages for bars
  const healthPercent = (health / maxHealth) * 100;
  const energyPercent = (energy / maxEnergy) * 100;
  const clicksPercent = (clicks / maxClicks) * 100;
  
  return (
    <div className="cyber-panel p-4">
      <h3 className="text-lg font-bold mb-2 text-center cyber-glow">RUNNER STATS</h3>
      
      {/* Health Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-cyber">HEALTH</span>
          <span className="text-sm font-cyber">{health}/{maxHealth}</span>
        </div>
        <div className="w-full h-3 bg-gray-800 border border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-400" 
            style={{ width: `${healthPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* Energy Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-cyber">ENERGY</span>
          <span className="text-sm font-cyber">{energy}/{maxEnergy}</span>
        </div>
        <div className="w-full h-3 bg-gray-800 border border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400" 
            style={{ width: `${energyPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* Clicks Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-cyber">CLICKS</span>
          <span className="text-sm font-cyber">{clicks}/{maxClicks}</span>
        </div>
        <div className="w-full h-3 bg-gray-800 border border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400" 
            style={{ width: `${clicksPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* Resources */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between">
          <span className="text-sm font-cyber">CREDITS</span>
          <span className="text-sm font-mono text-yellow-400">{credits}¢</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-cyber">INFLUENCE</span>
          <span className="text-sm font-mono text-purple-400">{influence}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
