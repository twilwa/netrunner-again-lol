import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { ArrowLeft, Play, Trash2 } from 'lucide-react';
import { Card } from '../types';

const MissionPrep: React.FC = () => {
  const { territoryId } = useParams<{ territoryId: string }>();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [viewTab, setViewTab] = useState<'mission' | 'deck'>('mission');
  
  // Get territory data
  const territory = state.territories.find(t => t.id === territoryId);
  
  // Start mission
  const startMission = () => {
    if (!territory) return;
    
    dispatch({ type: 'START_MISSION', territoryId: territory.id });
    navigate('/');
  };
  
  // Calculate card type distribution for pie chart (simplified)
  const cardTypeCount = state.playerDeck.reduce((acc: Record<string, number>, card: Card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {});
  
  if (!territory) {
    return <div>Territory not found</div>;
  }
  
  // Calculate security level
  const securityLevel = territory.securityLevel || Math.floor(territory.influenceLevel / 20) + 1;
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold cyber-glow">MISSION PREP: {territory.name.toUpperCase()}</h1>
          <button 
            className="cyber-btn flex items-center gap-2"
            onClick={() => navigate(`/marketplace/${territoryId}`)}
          >
            <ArrowLeft size={18} />
            <span>BACK TO MARKETPLACE</span>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Mission Info */}
          <div className="col-span-8">
            <div className="cyber-panel p-6 mb-6">
              {/* Tabs */}
              <div className="flex border-b border-gray-700 mb-4">
                <button 
                  className={`px-4 py-2 -mb-px ${viewTab === 'mission' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setViewTab('mission')}
                >
                  Mission Brief
                </button>
                <button 
                  className={`px-4 py-2 -mb-px ${viewTab === 'deck' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
                  onClick={() => setViewTab('deck')}
                >
                  Deck Analysis
                </button>
              </div>
              
              {viewTab === 'mission' && (
                <div>
                  <h2 className="text-2xl font-bold mb-3">{territory.name} Operations</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400 mb-2">Mission Overview</h3>
                      <p className="mb-2">
                        This {territory.type} zone currently has a security level of {securityLevel}/5 and is 
                        controlled by {territory.controlledBy} forces.
                      </p>
                      <p>
                        {territory.controlledBy === 'corp' 
                          ? "Corporate security is active in this area. Expect resistance and automated defenses." 
                          : territory.controlledBy === 'runner'
                          ? "Runner-friendly territory. Reduced security presence, but still exercise caution."
                          : "Contested zone with unpredictable security patterns. Stay alert."
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400 mb-2">Objectives</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Infiltrate the {territory.type} facility</li>
                        <li>Locate and secure the primary data node</li>
                        <li>Extract safely without raising the alarm</li>
                        {territory.controlledBy === 'corp' && (
                          <li>Reduce corporate influence in the area</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400 mb-2">Threat Assessment</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm">Security Level:</div>
                        <div className="flex">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i} className={i < securityLevel ? "text-yellow-500" : "text-gray-600"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p>
                        {securityLevel <= 2
                          ? "Low security presence. Minimal resistance expected." 
                          : securityLevel <= 4
                          ? "Moderate security. Prepared defenses and patrols are likely."
                          : "High security alert. Maximum resistance and advanced countermeasures deployed."
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400 mb-2">Rewards</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Credits: {5 + securityLevel * 2}¢ - {10 + securityLevel * 3}¢</li>
                        <li>Influence gain in territory</li>
                        <li>Potential for rare equipment acquisition</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {viewTab === 'deck' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Runner Loadout Analysis</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">Deck Composition</h3>
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Cards:</span>
                            <span>{state.playerDeck.length}</span>
                          </div>
                          {Object.entries(cardTypeCount).map(([type, count]) => (
                            <div key={type} className="flex justify-between">
                              <span>{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                              <span>{count} ({Math.round(count/state.playerDeck.length*100)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        {/* Simple graphical representation */}
                        <div className="bg-gray-800 p-3 rounded">
                          {Object.entries(cardTypeCount).map(([type, count]) => (
                            <div key={type} className="mb-1">
                              <div className="text-xs mb-1">{type}</div>
                              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    type === 'attack' ? 'bg-red-500' : 
                                    type === 'move' ? 'bg-blue-500' : 
                                    type === 'hack' ? 'bg-green-500' : 
                                    type === 'skill' ? 'bg-purple-500' : 
                                    'bg-amber-500'
                                  }`} 
                                  style={{ width: `${count/state.playerDeck.length*100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">Deck Cards</h3>
                    <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {state.playerDeck.map(card => (
                        <div 
                          key={card.id}
                          className="bg-gray-800 border border-gray-700 p-2 rounded text-sm"
                        >
                          <div className="flex justify-between">
                            <div>{card.name}</div>
                            <div className="text-yellow-400">{card.cost}¢</div>
                          </div>
                          <div className="text-xs text-gray-400">{card.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mission Controls */}
          <div className="col-span-4">
            <div className="cyber-panel p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">RUNNER STATUS</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Health:</span>
                  <span>{state.player.health}/{state.player.maxHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Energy:</span>
                  <span>{state.player.maxEnergy}/{state.player.maxEnergy}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <span className="text-yellow-400">{state.playerCredits}¢</span>
                </div>
                <div className="flex justify-between">
                  <span>Deck Size:</span>
                  <span>{state.playerDeck.length} cards</span>
                </div>
              </div>
              
              <button 
                className="cyber-btn font-cyber text-center w-full"
                onClick={startMission}
              >
                <div className="flex items-center justify-center gap-2">
                  <Play size={18} />
                  <span>BEGIN MISSION</span>
                </div>
              </button>
            </div>
            
            <div className="cyber-panel p-4">
              <h2 className="text-xl font-bold mb-4">MISSION RECOMMENDATIONS</h2>
              
              <div className="space-y-4 text-sm">
                {securityLevel >= 4 && (
                  <div className="p-2 bg-red-900 bg-opacity-30 border border-red-800 rounded">
                    <div className="font-bold text-red-400 mb-1">WARNING: High Security</div>
                    <p>Corporate security in this zone is significantly elevated. Consider acquiring additional attack cards.</p>
                  </div>
                )}
                
                {territory.type === 'corporate' && (
                  <div className="p-2 bg-blue-900 bg-opacity-30 border border-blue-800 rounded">
                    <div className="font-bold text-blue-400 mb-1">Corporate Architecture</div>
                    <p>Corporate zones typically have advanced ICE protection. Ensure you have adequate hacking cards.</p>
                  </div>
                )}
                
                {territory.type === 'slums' && (
                  <div className="p-2 bg-amber-900 bg-opacity-30 border border-amber-800 rounded">
                    <div className="font-bold text-amber-400 mb-1">Unpredictable Terrain</div>
                    <p>Slum areas feature irregular layouts and environmental hazards. Movement cards are recommended.</p>
                  </div>
                )}
                
                {state.playerDeck.filter(c => c.type === 'attack').length < 3 && (
                  <div className="p-2 bg-gray-800 rounded">
                    <div className="font-bold text-gray-300 mb-1">Combat Capability</div>
                    <p>Your attack capabilities seem limited. Consider adding more offensive cards to your deck.</p>
                  </div>
                )}
                
                {state.playerDeck.length < 10 && (
                  <div className="p-2 bg-gray-800 rounded">
                    <div className="font-bold text-gray-300 mb-1">Deck Size</div>
                    <p>Your deck is relatively small. A larger deck will give you more options during the mission.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionPrep;
