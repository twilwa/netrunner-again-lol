import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="w-16 h-16 border-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-2xl font-cyber text-cyan-400 mb-2">LOADING</h2>
        <p className="text-gray-400 font-mono">Initializing system...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
