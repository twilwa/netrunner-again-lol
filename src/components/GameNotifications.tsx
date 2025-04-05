import React from 'react';

interface GameNotificationsProps {
  notifications: string[];
}

const GameNotifications: React.FC<GameNotificationsProps> = ({ notifications }) => {
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-20 right-4 z-20 p-4 w-64 pointer-events-none">
      <div className="cyber-panel bg-gray-900 bg-opacity-90 p-3">
        <h3 className="text-sm font-bold mb-2 cyber-glow">SYSTEM LOG</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-800 scrollbar-track-gray-900 pr-1 pointer-events-auto">
          {notifications.map((notification, index) => (
            <div 
              key={index} 
              className="text-xs py-1 border-b border-gray-800"
              style={{ 
                opacity: 1 - (index * 0.1),
                animation: `fadeIn 0.3s ease-in-out ${index * 0.1}s both`
              }}
            >
              {notification}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameNotifications;
