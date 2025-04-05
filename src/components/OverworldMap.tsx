import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import TerritoryHex from './TerritoryHex';
import { ArrowLeft, Database, Eye, Minus, Plus, Zap } from 'lucide-react';
import GameNotifications from './GameNotifications';
import TurnPhaseBar from './TurnPhaseBar';

const OverworldMap: React.FC = () => {
  const { state, dispatch } = useGame();
  const [zoomLevel, setZoomLevel] = useState(1);

  // Handle territory selection
  const handleTerritoryClick = (territoryId: string) => {
    dispatch({ type: 'SELECT_TERRITORY', territoryId });
  };

  // Apply card to territory
  const applyCardToTerritory = (territoryId: string) => {
    if (!state.activeCard) return;
    
    // Check if player has enough energy to play the card
    if (state.player.energy < state.activeCard.cost) {
      dispatch({ type: 'ADD_NOTIFICATION', message: `Not enough energy to play ${state.activeCard.name}` });
      return;
    }
    
    // Check if in action phase with actions remaining
    if (state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0) {
      dispatch({ type: 'ADD_NOTIFICATION', message: "Cannot play cards now!" });
      return;
    }
    
    if (state.activeCard.type === 'hack') {
      // Reduce corporate control
      dispatch({ 
        type: 'UPDATE_TERRITORY_INFLUENCE', 
        territoryId, 
        amount: -10,
        faction: 'runner'
      });
      dispatch({ type: 'PLAY_CARD', card: state.activeCard });
    } else if (state.activeCard.type === 'resource') {
      // Play resource card - its effect is handled by the card's effect function
      dispatch({ type: 'PLAY_CARD', card: state.activeCard });
    } else if (state.activeCard.type === 'skill') {
      // Increase runner control
      dispatch({ 
        type: 'UPDATE_TERRITORY_INFLUENCE', 
        territoryId, 
        amount: -15,
        faction: 'runner'
      });
      dispatch({ type: 'PLAY_CARD', card: state.activeCard });
    } else if (state.activeCard.type === 'attack') {
      // Targeted attack on corporate assets
      dispatch({ 
        type: 'UPDATE_TERRITORY_INFLUENCE', 
        territoryId, 
        amount: -5 * (state.activeCard.damage || 1),
        faction: 'runner'
      });
      dispatch({ type: 'PLAY_CARD', card: state.activeCard });
    }
    
    dispatch({ type: 'SELECT_TERRITORY', territoryId: null });
  };

  // Function to end the current phase and move to the next
  const handleEndPhase = () => {
    dispatch({ type: 'END_TURN' });
  };

  // Filter territories by faction control
  const getControlledTerritories = (faction: string) => {
    return state.territories.filter(t => t.controlledBy === faction);
  };

  // Calculate territory stats
  const territoryStats = {
    runner: getControlledTerritories('runner').length,
    corp: getControlledTerritories('corp').length,
    neutral: getControlledTerritories('neutral').length,
    total: state.territories.length
  };

  // Calculate total credits from territory control
  const calculateTotalIncome = () => {
    return calculateResourceGain(state.territories, state.playerFaction);
  };

  // Resource calculation function (same as in GameContext)
  function calculateResourceGain(territories: any[], faction: 'runner' | 'corp'): number {
    let credits = 0;
    
    territories.forEach(territory => {
      if (territory.controlledBy === faction) {
        // Base income is 2 credits per controlled territory
        let territoryIncome = 2;
        
        // Higher influence provides bonus income
        if (faction === 'runner' && territory.influenceLevel <= 30) {
          territoryIncome += 1; // Strong runner control provides bonus
        } else if (faction === 'corp' && territory.influenceLevel >= 70) {
          territoryIncome += 1; // Strong corp control provides bonus
        }
        
        // Territory types provide different incomes
        if (territory.type === 'corporate') {
          territoryIncome += faction === 'corp' ? 2 : 0;
        } else if (territory.type === 'slums') {
          territoryIncome += faction === 'runner' ? 1 : 0;
        }
        
        credits += territoryIncome;
      } else if (territory.controlledBy === 'neutral') {
        // Even neutral territories provide some income if you have influence
        if ((faction === 'runner' && territory.influenceLevel < 50) || 
            (faction === 'corp' && territory.influenceLevel > 50)) {
          credits += 1;
        }
      }
    });
    
    return credits;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Turn Phase Bar */}
      <TurnPhaseBar 
        currentPhase={state.gamePhase} 
        turnCount={state.turnCount}
        clicksRemaining={state.clicksRemaining}
      />

      {/* Game Notifications */}
      <GameNotifications notifications={state.notifications} />

      <div className="max-w-6xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold cyber-glow">NIGHT CITY - DISTRICT MAP</h1>
          <div className="flex gap-3 items-center">
            <button 
              className="cyber-btn p-2" 
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
              title="Zoom Out"
            >
              <Minus size={18} />
            </button>
            <span className="font-cyber">{Math.round(zoomLevel * 100)}%</span>
            <button 
              className="cyber-btn p-2" 
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
              title="Zoom In"
            >
              <Plus size={18} />
            </button>
            <Link to="/" className="cyber-btn flex items-center gap-2">
              <ArrowLeft size={18} />
              <span>TACTICAL VIEW</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Territory Stats */}
          <div className="col-span-3">
            <div className="cyber-panel p-4 mb-4">
              <h2 className="text-xl font-bold mb-4 cyber-glow">TERRITORY CONTROL</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    Runner
                  </span>
                  <span className="font-mono">{territoryStats.runner}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Corp
                  </span>
                  <span className="font-mono">{territoryStats.corp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    Neutral
                  </span>
                  <span className="font-mono">{territoryStats.neutral}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span>Total</span>
                    <span className="font-mono">{territoryStats.total}</span>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-700">
                  <div className="flex justify-between items-center font-bold">
                    <span>Credit Income:</span>
                    <span className="font-mono text-yellow-400">+{calculateTotalIncome()}¢/turn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Stats */}
            <div className="cyber-panel p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">RUNNER STATS</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Database size={16} />
                    Credits
                  </span>
                  <span className="font-mono text-yellow-400">{state.playerCredits}¢</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Zap size={16} />
                    Influence
                  </span>
                  <span className="font-mono text-purple-400">{state.playerInfluencePoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Eye size={16} />
                    Actions
                  </span>
                  <span className="font-mono text-cyan-400">{state.clicksRemaining}/{state.maxClicks}</span>
                </div>
              </div>
              
              {/* Active Card */}
              {state.activeCard && (
                <div className="mt-4 border border-cyan-800 p-2 rounded">
                  <h3 className="text-sm mb-1">ACTIVE CARD:</h3>
                  <div className="text-cyan-400 font-bold">{state.activeCard.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Select a territory to apply effect
                  </div>
                </div>
              )}

              {/* End Phase Button */}
              <button 
                onClick={handleEndPhase} 
                className="cyber-btn w-full mt-4"
              >
                END {state.gamePhase.split('_')[0]} PHASE
              </button>
            </div>

            {/* Card Hand */}
            <div className="cyber-panel p-4">
              <h2 className="text-xl font-bold mb-2">OVERWORLD CARDS</h2>
              <div className="space-y-2">
                {(state.overworldHand || []).map(card => (
                  <div 
                    key={card.id}
                    className={`p-2 bg-gray-800 border ${
                      state.activeCard?.id === card.id ? 'border-cyan-500' : 'border-gray-700'
                    } rounded cursor-pointer hover:bg-gray-700`}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_CARD', card })}
                  >
                    <div className="flex justify-between">
                      <span>{card.name}</span>
                      <span className="text-yellow-400">{card.cost}¢</span>
                    </div>
                    <div className="text-xs text-gray-400">{card.type}</div>
                  </div>
                ))}

                {(!state.overworldHand || state.overworldHand.length === 0) && (
                  <div className="text-gray-500 text-center py-2">
                    No cards in hand
                  </div>
                )}

                <button 
                  className="cyber-btn w-full mt-2" 
                  onClick={() => dispatch({ type: 'DRAW_OVERWORLD_CARD' })}
                  disabled={state.gamePhase !== 'ACTION_PHASE' || state.clicksRemaining <= 0}
                >
                  DRAW CARD
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Hex Grid Map */}
          <div className="col-span-9 relative">
            <div className="cyber-panel p-4 pb-8 min-h-[600px] relative overflow-hidden">
              <div 
                className="hex-grid-container transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Hex Grid Map */}
                <div className="hex-grid">
                  {state.territories.map((territory) => (
                    <TerritoryHex
                      key={territory.id}
                      territory={territory}
                      isSelected={state.selectedTerritory === territory.id}
                      onClick={() => {
                        if (state.activeCard) {
                          applyCardToTerritory(territory.id);
                        } else {
                          handleTerritoryClick(territory.id);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Territory Details Panel */}
              {state.selectedTerritory && (
                <div className="absolute bottom-4 right-4 w-64 bg-gray-800 border border-cyan-500 p-3 rounded shadow-lg">
                  {(() => {
                    const territory = state.territories.find(t => t.id === state.selectedTerritory);
                    if (!territory) return null;
                    
                    // Calculate income from this territory
                    let territoryIncome = 0;
                    if (territory.controlledBy === state.playerFaction) {
                      territoryIncome = 2;
                      
                      // Territory-specific bonuses
                      if (territory.type === 'corporate' && state.playerFaction === 'corp') {
                        territoryIncome += 2;
                      } else if (territory.type === 'slums' && state.playerFaction === 'runner') {
                        territoryIncome += 1;
                      }
                      
                      // Influence bonuses
                      if (state.playerFaction === 'runner' && territory.influenceLevel <= 30) {
                        territoryIncome += 1;
                      } else if (state.playerFaction === 'corp' && territory.influenceLevel >= 70) {
                        territoryIncome += 1;
                      }
                    } else if (territory.controlledBy === 'neutral') {
                      if ((state.playerFaction === 'runner' && territory.influenceLevel < 50) || 
                          (state.playerFaction === 'corp' && territory.influenceLevel > 50)) {
                        territoryIncome = 1;
                      }
                    }
                    
                    return (
                      <>
                        <h3 className="text-lg font-bold mb-1">{territory.name}</h3>
                        <div className="text-sm text-gray-300 mb-2">Type: {territory.type}</div>
                        
                        {/* Income information */}
                        <div className="text-sm mb-2">
                          <span className="text-yellow-400">Income: {territoryIncome}¢/turn</span>
                        </div>
                        
                        {/* Influence Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Runner</span>
                            <span>Corp</span>
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500" 
                              style={{ width: `${100 - territory.influenceLevel}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>{100 - territory.influenceLevel}%</span>
                            <span>{territory.influenceLevel}%</span>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Controlled by:</span>
                            <span className={`font-bold ${
                              territory.controlledBy === 'runner' ? 'text-cyan-400' : 
                              territory.controlledBy === 'corp' ? 'text-red-400' : 
                              'text-gray-400'
                            }`}>
                              {territory.controlledBy?.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex justify-between">
                            {territory.mission && (
                              <Link 
                                to={`/marketplace/${territory.id}`}
                                className="cyber-btn text-xs px-2 py-1"
                              >
                                PREPARE MISSION
                              </Link>
                            )}
                            <button 
                              className="text-xs text-gray-400 hover:text-gray-200"
                              onClick={() => dispatch({ type: 'SELECT_TERRITORY', territoryId: null })}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              
              {/* Map background details */}
              <div className="absolute top-4 left-4 text-xs text-gray-500 font-cyber z-0">
                NIGHT CITY NETWORK // DISTRICT MAP V2.3
              </div>
              <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-cyber z-0">
                SECURITY LEVEL: MODERATE // CONNECTION: SECURED
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverworldMap;
