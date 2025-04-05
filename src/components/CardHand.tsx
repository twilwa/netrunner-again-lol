import React from 'react';
import { Card } from '../types';

interface CardHandProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  onCardDiscard: (card: Card) => void;
  activeCard: Card | null;
  playerEnergy: number;
}

const CardHand: React.FC<CardHandProps> = ({ 
  cards, 
  onCardClick, 
  onCardDiscard,
  activeCard,
  playerEnergy
}) => {
  // Card type to color mapping
  const typeColors = {
    attack: 'from-red-700 to-red-900',
    move: 'from-blue-700 to-blue-900',
    skill: 'from-purple-700 to-purple-900',
    hack: 'from-green-700 to-green-900',
    resource: 'from-amber-700 to-amber-900'
  };

  // Faction to accent color mapping
  const factionColors = {
    'RUNNER': 'border-cyan-500',
    'CRIMINAL': 'border-blue-500',
    'ANARCH': 'border-orange-500',
    'SHAPER': 'border-green-500',
    'NEUTRAL': 'border-gray-500'
  };

  return (
    <div className="cyber-panel p-4">
      <h3 className="text-lg font-bold mb-2 text-center cyber-glow">HAND - {cards.length} CARDS</h3>
      
      <div className="flex justify-center gap-3 p-2 overflow-x-auto min-h-[180px]">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center text-gray-400">
            No cards in hand. Draw cards or end turn.
          </div>
        ) : (
          cards.map((card) => {
            const isActive = activeCard && activeCard.id === card.id;
            const canAfford = playerEnergy >= card.cost;
            const cardTypeColor = typeColors[card.type as keyof typeof typeColors] || 'from-gray-700 to-gray-900';
            const cardFactionColor = factionColors[card.faction as keyof typeof factionColors] || 'border-gray-500';
            
            return (
              <div 
                key={card.id}
                className={`
                  relative w-32 h-44 rounded p-2 cursor-pointer transform transition-all duration-200
                  bg-gradient-to-b ${cardTypeColor} 
                  border-2 ${cardFactionColor}
                  ${isActive ? 'scale-110 shadow-lg border-opacity-100' : 'hover:scale-105 border-opacity-70'}
                  ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => canAfford && onCardClick(card)}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-white font-bold">{card.cost}</span>
                  <span className="text-xs text-gray-300">{card.faction}</span>
                </div>
                
                <h4 className="text-white font-bold text-sm mb-1 truncate">{card.name}</h4>
                <div className="text-xs text-gray-200 italic mb-2">{card.type}</div>
                
                <div className="text-xs text-gray-200 h-16 overflow-y-auto">
                  {card.description}
                </div>
                
                <div className="absolute bottom-1 right-1">
                  {isActive && (
                    <button 
                      className="text-xs bg-red-800 hover:bg-red-700 text-white px-1 py-0.5 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardDiscard(card);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CardHand;
