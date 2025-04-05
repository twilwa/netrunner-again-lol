import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import TacticalView from './components/TacticalView';
import Marketplace from './components/Marketplace';
import OverworldMap from './components/OverworldMap';
import TerritorySelect from './components/TerritorySelect';
import MissionPrep from './components/MissionPrep';
import { GameProvider } from './context/GameContext';

export function App() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 font-rajdhani text-cyan-300">
      <Router>
        <GameProvider>
          <Routes>
            <Route path="/" element={<TacticalView />} />
            <Route path="/overworld" element={<OverworldMap />} />
            <Route path="/territory-select" element={<TerritorySelect />} />
            <Route path="/marketplace/:territoryId" element={<Marketplace />} />
            <Route path="/mission-prep/:territoryId" element={<MissionPrep />} />
          </Routes>
        </GameProvider>
      </Router>
    </div>
  );
}

export default App;
