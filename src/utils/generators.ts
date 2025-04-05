import { Card, HexTile, Territory } from '../types';

export function generateHexGrid(radius: number): HexTile[] {
  const tiles: HexTile[] = [];
  
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    
    for (let r = r1; r <= r2; r++) {
      const elevation = Math.random() * 0.3;
      const type = Math.random() > 0.85 ? 'blocked' : 'normal';
      
      tiles.push({
        id: `${q},${r}`,
        coord: { q, r },
        type,
        elevation,
        influenceLevel: 50 // Default neutral influence
      });
    }
  }
  
  return tiles;
}

export function generateTerritories(): Territory[] {
  // Create a predefined set of territories for the overworld map
  const territories: Territory[] = [
    {
      id: 'downtown',
      name: 'Downtown',
      type: 'corporate',
      coord: { q: 0, r: 0 },
      influenceLevel: 50,
      controlledBy: 'neutral',
      mission: true
    },
    {
      id: 'financial',
      name: 'Financial District',
      type: 'corporate',
      coord: { q: 1, r: -1 },
      influenceLevel: 75,
      controlledBy: 'corp',
      mission: true
    },
    {
      id: 'industrial',
      name: 'Industrial Zone',
      type: 'corporate',
      coord: { q: 2, r: -2 },
      influenceLevel: 70,
      controlledBy: 'corp'
    },
    {
      id: 'residential',
      name: 'Residential Area',
      type: 'fringe',
      coord: { q: -1, r: 1 },
      influenceLevel: 45,
      controlledBy: 'neutral',
      mission: true
    },
    {
      id: 'slums',
      name: 'Slums',
      type: 'slums',
      coord: { q: -2, r: 2 },
      influenceLevel: 30,
      controlledBy: 'runner'
    },
    {
      id: 'black_market',
      name: 'Black Market',
      type: 'slums',
      coord: { q: -1, r: 2 },
      influenceLevel: 25,
      controlledBy: 'runner',
      mission: true
    },
    {
      id: 'tech_hub',
      name: 'Tech Hub',
      type: 'corporate',
      coord: { q: 0, r: -2 },
      influenceLevel: 60,
      controlledBy: 'corp'
    },
    {
      id: 'data_center',
      name: 'Data Center',
      type: 'corporate',
      coord: { q: 1, r: -3 },
      influenceLevel: 80,
      controlledBy: 'corp',
      mission: true
    },
    {
      id: 'research_lab',
      name: 'Research Lab',
      type: 'corporate',
      coord: { q: 2, r: -4 },
      influenceLevel: 85,
      controlledBy: 'corp'
    },
    {
      id: 'nightlife',
      name: 'Nightlife District',
      type: 'fringe',
      coord: { q: 0, r: 1 },
      influenceLevel: 55,
      controlledBy: 'neutral'
    },
    {
      id: 'underground',
      name: 'Underground',
      type: 'slums',
      coord: { q: -3, r: 3 },
      influenceLevel: 20,
      controlledBy: 'runner'
    },
    {
      id: 'hacker_den',
      name: 'Hacker Den',
      type: 'slums',
      coord: { q: -2, r: 0 },
      influenceLevel: 15,
      controlledBy: 'runner',
      mission: true
    }
  ];
  
  return territories;
}

export function generateInitialCards(): Card[] {
  const cards: Card[] = [
    {
      id: 'card-1',
      name: 'Hack',
      cost: 1,
      type: 'hack',
      faction: 'RUNNER',
      description: 'Attempt to hack a system within range 2.',
      effect: (state) => state,
      range: 2
    },
    {
      id: 'card-2',
      name: 'Quick Strike',
      cost: 1,
      type: 'attack',
      faction: 'RUNNER',
      description: 'Deal 3 damage to an adjacent target.',
      effect: (state) => state,
      damage: 3,
      range: 1
    },
    {
      id: 'card-3',
      name: 'Tactical Move',
      cost: 1,
      type: 'move',
      faction: 'RUNNER',
      description: 'Move up to 3 hexes.',
      effect: (state) => state,
      range: 3
    },
    {
      id: 'card-4',
      name: 'Datasucker',
      cost: 2,
      type: 'skill',
      faction: 'RUNNER',
      description: 'Install: Reduce target system\'s security by 1.',
      effect: (state) => state,
      range: 2
    },
    {
      id: 'card-5',
      name: 'Armitage Codebusting',
      cost: 1,
      type: 'resource',
      faction: 'RUNNER',
      description: 'Gain 3 credits.',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 3
      })
    },
    {
      id: 'card-6',
      name: 'Inside Job',
      cost: 2,
      type: 'hack',
      faction: 'CRIMINAL',
      description: 'Bypass the first ICE encountered in a run.',
      effect: (state) => state,
      influenceCost: 1
    },
    {
      id: 'card-7',
      name: 'Corroder',
      cost: 2,
      type: 'attack',
      faction: 'ANARCH',
      description: 'Break barrier subroutines for 1 credit each.',
      effect: (state) => state,
      influenceCost: 1
    },
    {
      id: 'card-8',
      name: 'Stimhack',
      cost: 0,
      type: 'skill',
      faction: 'ANARCH',
      description: 'Gain 9 temporary credits. Take 1 brain damage.',
      effect: (state) => state,
      influenceCost: 1
    },
    {
      id: 'card-9',
      name: 'Easy Mark',
      cost: 0,
      type: 'resource',
      faction: 'NEUTRAL',
      description: 'Gain 3 credits.',
      effect: (state) => ({
        ...state,
        playerCredits: state.playerCredits + 3
      })
    },
    {
      id: 'card-10',
      name: 'Test Run',
      cost: 3,
      type: 'skill',
      faction: 'SHAPER',
      description: 'Search for and install a program, return it to your deck at end of turn.',
      effect: (state) => state,
      influenceCost: 1
    }
  ];
  
  // Shuffle cards
  return cards.sort(() => Math.random() - 0.5);
}
