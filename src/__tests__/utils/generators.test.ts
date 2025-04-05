import { generateHexGrid, generateTerritories, generateInitialCards } from '../../utils/generators';

describe('Generator Functions', () => {
  describe('generateHexGrid', () => {
    test('generates the correct number of hexes for a given radius', () => {
      const radius = 2;
      // For a hex grid with radius r, the number of hexes is 3r² + 3r + 1
      const expectedHexCount = 3 * radius * radius + 3 * radius + 1;
      
      const grid = generateHexGrid(radius);
      
      expect(grid.length).toBe(expectedHexCount);
    });

    test('assigns proper coordinates to hexes', () => {
      const grid = generateHexGrid(1);
      
      // For radius 1, we expect hexes at:
      // (0,0), (1,0), (1,-1), (0,-1), (-1,0), (-1,1), (0,1)
      const expectedCoords = [
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        { q: 1, r: -1 },
        { q: 0, r: -1 },
        { q: -1, r: 0 },
        { q: -1, r: 1 },
        { q: 0, r: 1 }
      ];
      
      expectedCoords.forEach(coord => {
        const hexExists = grid.some(hex => 
          hex.coord.q === coord.q && hex.coord.r === coord.r
        );
        expect(hexExists).toBe(true);
      });
    });

    test('generates each hex with required properties', () => {
      const grid = generateHexGrid(1);
      
      grid.forEach(hex => {
        expect(hex).toHaveProperty('id');
        expect(hex).toHaveProperty('coord');
        expect(hex).toHaveProperty('type');
        expect(hex).toHaveProperty('elevation');
        expect(hex).toHaveProperty('influenceLevel');
        
        // ID should be in the format "q,r"
        expect(hex.id).toBe(`${hex.coord.q},${hex.coord.r}`);
        
        // Type should be either 'normal' or 'blocked'
        expect(['normal', 'blocked']).toContain(hex.type);
        
        // Elevation should be a number between 0 and 0.3
        expect(hex.elevation).toBeGreaterThanOrEqual(0);
        expect(hex.elevation).toBeLessThanOrEqual(0.3);
        
        // Influence level should be 50 (neutral by default)
        expect(hex.influenceLevel).toBe(50);
      });
    });
  });

  describe('generateTerritories', () => {
    test('generates predefined territories', () => {
      const territories = generateTerritories();
      
      // Check that we have multiple territories
      expect(territories.length).toBeGreaterThan(0);
      
      // Check each territory has the required properties
      territories.forEach(territory => {
        expect(territory).toHaveProperty('id');
        expect(territory).toHaveProperty('name');
        expect(territory).toHaveProperty('type');
        expect(territory).toHaveProperty('coord');
        expect(territory).toHaveProperty('influenceLevel');
        expect(territory).toHaveProperty('controlledBy');
        
        // Type should be one of the predefined types
        expect(['corporate', 'slums', 'fringe', 'neutral']).toContain(territory.type);
        
        // Influence level should be between 0 and 100
        expect(territory.influenceLevel).toBeGreaterThanOrEqual(0);
        expect(territory.influenceLevel).toBeLessThanOrEqual(100);
        
        // Control should be one of the possible factions
        expect(['runner', 'corp', 'neutral']).toContain(territory.controlledBy);
      });
    });

    test('includes default downtown territory', () => {
      const territories = generateTerritories();
      
      // The downtown territory should exist
      const downtown = territories.find(t => t.id === 'downtown');
      expect(downtown).toBeDefined();
      
      if (downtown) {
        expect(downtown.name).toBe('Downtown');
        expect(downtown.type).toBe('corporate');
        expect(downtown.coord).toEqual({ q: 0, r: 0 });
        expect(downtown.influenceLevel).toBe(50);
        expect(downtown.controlledBy).toBe('neutral');
        expect(downtown.mission).toBe(true);
      }
    });
  });

  describe('generateInitialCards', () => {
    test('generates a non-empty array of cards', () => {
      const cards = generateInitialCards();
      
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    test('generates cards with all required properties', () => {
      const cards = generateInitialCards();
      
      cards.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('cost');
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('faction');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('effect');
        
        // Cost should be a non-negative number
        expect(card.cost).toBeGreaterThanOrEqual(0);
        
        // Type should be one of the predefined types
        expect(['attack', 'move', 'skill', 'hack', 'resource']).toContain(card.type);
        
        // Faction should be one of the predefined factions
        expect(['RUNNER', 'CRIMINAL', 'ANARCH', 'SHAPER', 'NEUTRAL']).toContain(card.faction);
        
        // Effect should be a function
        expect(typeof card.effect).toBe('function');
      });
    });

    test('returns a shuffled deck', () => {
      // Since the deck is randomly shuffled, we can't directly test the shuffling.
      // Instead, we'll call the function multiple times and verify we get different orders.
      
      const firstDeck = generateInitialCards();
      const secondDeck = generateInitialCards();
      
      // Compare first few cards to see if they're in different orders
      // This isn't a perfect test, but it's a reasonable approximation
      let isDifferent = false;
      for (let i = 0; i < Math.min(firstDeck.length, secondDeck.length); i++) {
        if (firstDeck[i].id !== secondDeck[i].id) {
          isDifferent = true;
          break;
        }
      }
      
      expect(isDifferent).toBe(true);
    });
  });
});
