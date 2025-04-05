import { 
  generateHexGrid, 
  generateTerritories, 
  generateInitialCards 
} from '../src/utils/generators';
import { HexType, TerritoryType, Faction, CardType } from '../src/types';

describe('Generator Functions', () => {
  // Test hex grid generation
  describe('generateHexGrid', () => {
    it('should generate the correct number of tiles for a given radius', () => {
      const radius = 2;
      // Formula for number of hexes in a grid with radius r: 3r² + 3r + 1
      const expectedCount = 3 * radius * radius + 3 * radius + 1; // 19 for radius 2
      
      const hexGrid = generateHexGrid(radius);
      expect(hexGrid.length).toBe(expectedCount);
    });
    
    it('should generate hexes with valid coordinates', () => {
      const radius = 1;
      const hexGrid = generateHexGrid(radius);
      
      // Check all coordinates are within radius bounds
      hexGrid.forEach(hex => {
        // Max distance from origin in cube coordinates
        const dist = Math.max(
          Math.abs(hex.coord.q), 
          Math.abs(hex.coord.r), 
          Math.abs(-hex.coord.q - hex.coord.r)
        );
        expect(dist).toBeLessThanOrEqual(radius);
      });
    });
    
    it('should assign unique IDs to all hexes', () => {
      const hexGrid = generateHexGrid(3);
      const ids = new Set(hexGrid.map(hex => hex.id));
      
      expect(ids.size).toBe(hexGrid.length);
    });
    
    it('should assign types and elevations to hexes', () => {
      const hexGrid = generateHexGrid(2);
      
      hexGrid.forEach(hex => {
        expect(hex.type).toBeDefined();
        expect(['normal', 'blocked', 'special']).toContain(hex.type);
        
        expect(hex.elevation).toBeDefined();
        expect(typeof hex.elevation).toBe('number');
        expect(hex.elevation).toBeGreaterThanOrEqual(0);
      });
    });
    
    it('should handle radius 0', () => {
      const hexGrid = generateHexGrid(0);
      expect(hexGrid.length).toBe(1);
      expect(hexGrid[0].coord.q).toBe(0);
      expect(hexGrid[0].coord.r).toBe(0);
    });
    
    it('should set default influence level for hexes', () => {
      const hexGrid = generateHexGrid(1);
      
      hexGrid.forEach(hex => {
        expect(hex.influenceLevel).toBeDefined();
        expect(hex.influenceLevel).toBe(50); // Default neutral influence
      });
    });
  });
  
  // Test territory generation
  describe('generateTerritories', () => {
    it('should generate a non-empty array of territories', () => {
      const territories = generateTerritories();
      
      expect(Array.isArray(territories)).toBe(true);
      expect(territories.length).toBeGreaterThan(0);
    });
    
    it('should create territories with all required properties', () => {
      const territories = generateTerritories();
      
      territories.forEach(territory => {
        expect(territory.id).toBeDefined();
        expect(territory.name).toBeDefined();
        expect(territory.type).toBeDefined();
        expect(territory.coord).toBeDefined();
        expect(territory.influenceLevel).toBeDefined();
        expect(territory.controlledBy).toBeDefined();
        
        // Verify territory type is valid
        expect(['corporate', 'slums', 'fringe', 'neutral']).toContain(territory.type);
        
        // Verify controlledBy is valid
        expect(['runner', 'corp', 'neutral']).toContain(territory.controlledBy);
        
        // Verify coordinates have q and r properties
        expect(territory.coord.q).toBeDefined();
        expect(territory.coord.r).toBeDefined();
        
        // Verify influence level is between 0 and 100
        expect(territory.influenceLevel).toBeGreaterThanOrEqual(0);
        expect(territory.influenceLevel).toBeLessThanOrEqual(100);
      });
    });
    
    it('should assign unique IDs to all territories', () => {
      const territories = generateTerritories();
      const ids = new Set(territories.map(t => t.id));
      
      expect(ids.size).toBe(territories.length);
    });
    
    it('should properly set territory control based on influence level', () => {
      const territories = generateTerritories();
      
      territories.forEach(territory => {
        // Runner control
        if (territory.controlledBy === 'runner') {
          expect(territory.influenceLevel).toBeLessThanOrEqual(40);
        }
        // Corp control
        else if (territory.controlledBy === 'corp') {
          expect(territory.influenceLevel).toBeGreaterThanOrEqual(60);
        }
        // Neutral territories
        else {
          expect(territory.influenceLevel).toBeGreaterThanOrEqual(40);
          expect(territory.influenceLevel).toBeLessThanOrEqual(60);
        }
      });
    });
    
    it('should include some territories with missions', () => {
      const territories = generateTerritories();
      const missionsCount = territories.filter(t => t.mission).length;
      
      expect(missionsCount).toBeGreaterThan(0);
    });
  });
  
  // Test card generation
  describe('generateInitialCards', () => {
    it('should generate a non-empty array of cards', () => {
      const cards = generateInitialCards();
      
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });
    
    it('should create cards with all required properties', () => {
      const cards = generateInitialCards();
      
      cards.forEach(card => {
        expect(card.id).toBeDefined();
        expect(card.name).toBeDefined();
        expect(card.cost).toBeDefined();
        expect(card.type).toBeDefined();
        expect(card.faction).toBeDefined();
        expect(card.description).toBeDefined();
        expect(card.effect).toBeDefined();
        
        // Verify card types are valid
        expect(['attack', 'move', 'skill', 'hack', 'resource']).toContain(card.type);
        
        // Verify factions are valid
        expect(['RUNNER', 'CRIMINAL', 'ANARCH', 'SHAPER', 'NEUTRAL']).toContain(card.faction);
        
        // Verify effect is a function
        expect(typeof card.effect).toBe('function');
      });
    });
    
    it('should assign unique IDs to all cards', () => {
      const cards = generateInitialCards();
      const ids = new Set(cards.map(card => card.id));
      
      expect(ids.size).toBe(cards.length);
    });
    
    it('should include various card types', () => {
      const cards = generateInitialCards();
      const types = new Set(cards.map(card => card.type));
      
      // Should have at least 3 different card types
      expect(types.size).toBeGreaterThanOrEqual(3);
    });
    
    it('should include cards from different factions', () => {
      const cards = generateInitialCards();
      const factions = new Set(cards.map(card => card.faction));
      
      // Should have at least 2 different factions
      expect(factions.size).toBeGreaterThanOrEqual(2);
    });
    
    it('should return cards in a random order (shuffled)', () => {
      // Generate cards twice and check if they're in a different order
      // Note: This test has a tiny probability of failing randomly
      const cards1 = generateInitialCards();
      const cards2 = generateInitialCards();
      
      // Check if at least one card is in a different position
      let isDifferent = false;
      for (let i = 0; i < Math.min(cards1.length, cards2.length); i++) {
        if (cards1[i].id !== cards2[i].id) {
          isDifferent = true;
          break;
        }
      }
      
      expect(isDifferent).toBe(true);
    });
  });
});
