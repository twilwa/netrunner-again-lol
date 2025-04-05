import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import TerritoryHex from './TerritoryHex';

const TerritorySelect: React.FC = () => {
  const { state } = useGame();
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  // Filter territories based on selected filter
  const filteredTerritories = state.territories.filter(territory => {
    if (filter === 'all') return true;
    if (filter === 'runner') return territory.controlledBy === 'runner';
    if (filter === 'corp') return territory.controlledBy === 'corp';
    if (filter === 'neutral') return territory.controlledBy === 'neutral';
    if (filter === 'mission') return territory.mission === true;
    return true;
  });
  
  const handleTerritoryClick = (territoryId: string) => {
    setSelectedTerritory(territoryId);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold cyber-glow">SELECT DEPLOYMENT ZONE</h1>
          <Link to="/overworld" className="cyber-btn flex items-center gap-2">
            <ArrowLeft size={18} />
            <span>BACK TO OVERWORLD</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Filters and Info */}
          <div className="col-span-3">
            <div className="cyber-panel p-4 mb-4">
              <h2 className="text-xl font-bold mb-4 cyber-glow">FILTERS</h2>
              <div className="space-y-2">
                <button 
                  className={`w-full text-left p-2 ${filter === 'all' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('all')}
                >
                  All Territories
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'runner' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('runner')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    Runner Controlled
                  </div>
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'corp' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('corp')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Corp Controlled
                  </div>
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'neutral' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('neutral')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    Neutral Zones
                  </div>
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'mission' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('mission')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Available Missions
                  </div>
                </button>
              </div>
            </div>

            {/* Territory Details */}
            {selectedTerritory && (
              <div className="cyber-panel p-4">
                {(() => {
                  const territory = state.territories.find(t => t.id === selectedTerritory);
                  if (!territory) return null;
                  
                  // Generate security rating display (1-5 stars)
                  const securityLevel = territory.securityLevel || 
                    Math.max(1, Math.min(5, Math.floor(territory.influenceLevel / 20)));
                  
                  const securityDisplay = Array(5).fill(0).map((_, i) => (
                    <span key={i} className={i < securityLevel ? "text-yellow-500" : "text-gray-600"}>★</span>
                  ));
                  
                  return (
                    <>
                      <h2 className="text-xl font-bold mb-3">{territory.name}</h2>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-400">Type:</div>
                          <div className="font-bold">{territory.type.charAt(0).toUpperCase() + territory.type.slice(1)}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400">Control:</div>
                          <div className={`font-bold ${
                            territory.controlledBy === 'runner' ? 'text-cyan-400' : 
                            territory.controlledBy === 'corp' ? 'text-red-400' : 
                            'text-gray-400'
                          }`}>
                            {territory.controlledBy.toUpperCase()}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400">Security Level:</div>
                          <div className="font-bold">{securityDisplay}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-400">Influence Balance:</div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-cyan-500" 
                              style={{ width: `${100 - territory.influenceLevel}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>Runner</span>
                            <span>Corp</span>
                          </div>
                        </div>
                        
                        {territory.mission && (
                          <div className="mt-4">
                            <Link 
                              to={`/marketplace/${territory.id}`}
                              className="cyber-btn font-cyber text-center w-full"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span>PREPARE FOR MISSION</span>
                                <ArrowRight size={18} />
                              </div>
                            </Link>
                          </div>
                        )}
                        
                        {!territory.mission && (
                          <div className="mt-4 text-sm text-yellow-400 text-center">
                            No available mission in this territory
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          
          {/* Main Content - Territory Map */}
          <div className="col-span-9">
            <div className="cyber-panel p-4 min-h-[600px] relative overflow-hidden">
              <h2 className="text-xl font-bold mb-4">TERRITORY MAP</h2>
              
              <div className="absolute inset-0 pt-16 pb-4 px-4">
                <div className="relative w-full h-full">
                  {filteredTerritories.map((territory) => (
                    <TerritoryHex
                      key={territory.id}
                      territory={territory}
                      isSelected={selectedTerritory === territory.id}
                      onClick={() => handleTerritoryClick(territory.id)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Map background elements */}
              <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-cyber z-0">
                SECURITY SCAN COMPLETE // SELECT DEPLOYMENT ZONE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerritorySelect;
