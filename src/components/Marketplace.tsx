import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Card } from '../types';
import { ArrowLeft, ArrowRight, Plus, ShoppingCart } from 'lucide-react';

const Marketplace: React.FC = () => {
  const { territoryId } = useParams<{ territoryId: string }>();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  
  // Get territory data
  const territory = state.territories.find(t => t.id === territoryId);
  
  // Generate available cards based on territory type and control
  useEffect(() => {
    if (!territory) return;
    
    // Base cards that are always available
    const baseCards = state.marketplaceCards.filter(card => card.faction === 'NEUTRAL');
    
    // Type-specific cards
    let typeCards: Card[] = [];
    if (territory.type === 'corporate') {
      typeCards = state.marketplaceCards.filter(card => 
        card.type === 'hack' || 
        card.type === 'attack'
      );
    } else if (territory.type === 'slums') {
      typeCards = state.marketplaceCards.filter(card => 
        card.type === 'resource' || 
        card.faction === 'ANARCH'
      );
    } else if (territory.type === 'fringe') {
      typeCards = state.marketplaceCards.filter(card => 
        card.faction === 'CRIMINAL' || 
        card.type === 'move'
      );
    }
    
    // Control-specific cards
    let controlCards: Card[] = [];
    if (territory.controlledBy === 'runner') {
      controlCards = state.marketplaceCards.filter(card => 
        card.faction === 'RUNNER' || 
        card.type === 'resource'
      );
    } else if (territory.controlledBy === 'corp') {
      controlCards = state.marketplaceCards.filter(card => 
        card.type === 'attack' || 
        card.type === 'hack'
      );
    }
    
    // Security level affects card availability
    const securityLevel = territory.securityLevel || Math.floor(territory.influenceLevel / 20) + 1;
    let securityCards: Card[] = [];
    
    if (securityLevel >= 4) {
      // High security areas have more expensive, powerful cards
      securityCards = state.marketplaceCards.filter(card => card.cost >= 4);
    } else if (securityLevel <= 2) {
      // Low security areas have cheaper, utility cards
      securityCards = state.marketplaceCards.filter(card => card.cost <= 3);
    }
    
    // Combine all cards, remove duplicates, and shuffle
    const allCards = [...baseCards, ...typeCards, ...controlCards, ...securityCards];
    const uniqueCards = Array.from(new Map(allCards.map(card => [card.id, card])).values());
    
    // Shuffle and limit to 12 cards for the marketplace
    const shuffledCards = uniqueCards.sort(() => Math.random() - 0.5).slice(0, 12);
    
    setAvailableCards(shuffledCards);
  }, [territory, state.marketplaceCards]);
  
  // Filter cards based on selected filter
  const filteredCards = filter === 'all' 
    ? availableCards 
    : availableCards.filter(card => card.type === filter);
  
  // Add card to selection
  const selectCard = (card: Card) => {
    if (selectedCards.find(c => c.id === card.id)) return;
    if (state.playerCredits < card.cost) {
      dispatch({ type: 'ADD_NOTIFICATION', message: "Not enough credits to purchase this card" });
      return;
    }
    
    setSelectedCards([...selectedCards, card]);
  };
  
  // Remove card from selection
  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(card => card.id !== cardId));
  };
  
  // Calculate total cost of selected cards
  const totalCost = selectedCards.reduce((sum, card) => sum + card.cost, 0);
  
  // Proceed to mission after purchasing cards
  const proceedToMission = () => {
    // Add cards to player's deck
    selectedCards.forEach(card => {
      dispatch({ type: 'ADD_CARD_TO_DECK', card });
    });
    
    // Deduct credits
    dispatch({ type: 'UPDATE_CREDITS', amount: -totalCost });
    
    // Notification
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      message: `Purchased ${selectedCards.length} cards for ${totalCost} credits`
    });
    
    // Navigate to mission prep
    navigate(`/mission-prep/${territoryId}`);
  };

  if (!territory) {
    return <div>Territory not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold cyber-glow">BLACK MARKET: {territory.name.toUpperCase()}</h1>
          <Link to={`/territory-select`} className="cyber-btn flex items-center gap-2">
            <ArrowLeft size={18} />
            <span>BACK TO SELECTION</span>
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="cyber-panel p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">RUNNER INFO</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Credits:</span>
                  <span className="text-yellow-400">{state.playerCredits}¢</span>
                </div>
                <div className="flex justify-between">
                  <span>Influence:</span>
                  <span className="text-purple-400">{state.playerInfluencePoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deck Size:</span>
                  <span>{state.playerDeck.length}</span>
                </div>
              </div>
            </div>

            <div className="cyber-panel p-4 mb-4">
              <h2 className="text-xl font-bold mb-4">FILTERS</h2>
              <div className="space-y-2">
                <button 
                  className={`w-full text-left p-2 ${filter === 'all' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('all')}
                >
                  All Cards
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'attack' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('attack')}
                >
                  Attack
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'move' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('move')}
                >
                  Movement
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'hack' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('hack')}
                >
                  Hacking
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'skill' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('skill')}
                >
                  Skills
                </button>
                <button 
                  className={`w-full text-left p-2 ${filter === 'resource' ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                  onClick={() => setFilter('resource')}
                >
                  Resources
                </button>
              </div>
            </div>
            
            {/* Cart */}
            <div className="cyber-panel p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">CART</h2>
                <div className="text-yellow-400 font-cyber">{totalCost}¢</div>
              </div>
              
              {selectedCards.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No cards selected
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {selectedCards.map(card => (
                    <div 
                      key={card.id} 
                      className="flex justify-between items-center p-2 bg-gray-800 rounded"
                    >
                      <div>
                        <div className="text-sm">{card.name}</div>
                        <div className="text-xs text-gray-400">{card.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-400">{card.cost}¢</div>
                        <button 
                          className="text-red-400 hover:text-red-300"
                          onClick={() => removeCard(card.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                className="cyber-btn font-cyber text-center w-full mt-2"
                onClick={proceedToMission}
                disabled={selectedCards.length === 0}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart size={16} />
                  <span>PURCHASE & EQUIP</span>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="cyber-panel p-6">
              <h2 className="text-2xl font-bold mb-2">AVAILABLE CARDS</h2>
              <div className="text-sm text-gray-400 mb-6">
                Cards available in this area are influenced by territory type, control, and security level.
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {filteredCards.map(card => (
                  <div 
                    key={card.id} 
                    className="bg-gray-800 border border-gray-700 p-4 rounded-md hover:border-cyan-500 transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">{card.name}</h3>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                        {card.faction}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2">
                      {card.type} • Cost: {card.cost}¢
                      {card.influenceCost && ` • Influence: ${card.influenceCost}`}
                    </div>
                    
                    <p className="text-sm mb-4">{card.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {card.range && `Range: ${card.range}`}
                        {card.damage && ` • Damage: ${card.damage}`}
                      </span>
                      
                      <button 
                        onClick={() => selectCard(card)}
                        disabled={state.playerCredits < card.cost || selectedCards.some(c => c.id === card.id)}
                        className={`cyber-btn text-sm flex items-center gap-1 ${
                          state.playerCredits < card.cost ? 'opacity-50 cursor-not-allowed' : 
                          selectedCards.some(c => c.id === card.id) ? 'bg-gray-600 cursor-default' : ''
                        }`}
                      >
                        {selectedCards.some(c => c.id === card.id) ? (
                          <span>Added</span>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredCards.length === 0 && (
                  <div className="col-span-3 text-center py-10 text-gray-400">
                    No cards available with the selected filter.
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

export default Marketplace;
