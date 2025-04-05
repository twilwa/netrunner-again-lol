import React from 'react';
import { Territory } from '../types';

interface TerritoryHexProps {
  territory: Territory;
  isSelected: boolean;
  onClick: () => void;
}

const TerritoryHex: React.FC<TerritoryHexProps> = ({ 
  territory, 
  isSelected, 
  onClick 
}) => {
  // Calculate position based on axial coordinates
  const size = 60; // hex size
  const width = size * 2;
  const height = Math.sqrt(3) * size;
  const horizDistance = width * 3/4;
  const vertDistance = height;
  
  const x = territory.coord.q * horizDistance;
  const y = territory.coord.r * vertDistance + territory.coord.q * vertDistance / 2;
  
  // Determine styling based on control
  let borderColor = 'border-gray-500'; // neutral
  let glowEffect = '';
  
  if (territory.controlledBy === 'runner') {
    borderColor = 'border-cyan-500';
    glowEffect = 'shadow-[0_0_8px_rgba(92,225,230,0.5)]';
  } else if (territory.controlledBy === 'corp') {
    borderColor = 'border-red-500';
    glowEffect = 'shadow-[0_0_8px_rgba(255,56,96,0.5)]';
  }
  
  // Enhance selected styling
  if (isSelected) {
    if (territory.controlledBy === 'runner') {
      glowEffect = 'shadow-[0_0_15px_rgba(92,225,230,0.8)]';
    } else if (territory.controlledBy === 'corp') {
      glowEffect = 'shadow-[0_0_15px_rgba(255,56,96,0.8)]';
    } else {
      glowEffect = 'shadow-[0_0_15px_rgba(255,255,255,0.5)]';
    }
  }
  
  // Determine background based on territory type
  let bgClass = 'bg-gray-800';
  
  if (territory.type === 'corporate') {
    bgClass = 'bg-gray-700 bg-opacity-70';
  } else if (territory.type === 'slums') {
    bgClass = 'bg-gray-800 bg-opacity-80';
  } else if (territory.type === 'fringe') {
    bgClass = 'bg-gray-800 bg-opacity-50';
  }

  // Calculate influence indicator width
  const runnerInfluence = 100 - territory.influenceLevel;
  const corpInfluence = territory.influenceLevel;

  return (
    <div 
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 hex-territory ${bgClass} ${borderColor} ${glowEffect} border-2 transition-all duration-300 cursor-pointer hover:z-10`}
      style={{ 
        left: `${x + 300}px`, 
        top: `${y + 250}px`,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
        <div className="text-xs font-bold truncate max-w-full">
          {territory.name}
        </div>
        
        {/* Influence indicator at bottom */}
        <div className="absolute bottom-3 w-2/3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500" 
            style={{ width: `${runnerInfluence}%` }}
          ></div>
        </div>
        
        {/* Status indicator - pulsing dot */}
        <div className={`
          absolute top-3 right-3 w-2 h-2 rounded-full 
          ${territory.mission ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}
        `}></div>
      </div>
    </div>
  );
};

export default TerritoryHex;
