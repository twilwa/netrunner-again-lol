import { 
  axialToCube, 
  cubeToAxial, 
  getHexPosition, 
  getHexDistance, 
  getHexNeighbors,
  getHexesInRange,
  findHexByCoord,
  areHexCoordsEqual
} from '../src/utils/hexUtils';
import { HexCoord, HexTile } from '../src/types';

describe('Hex Utility Functions', () => {
  // Test axialToCube conversion
  describe('axialToCube', () => {
    it('should convert axial coordinates to cube coordinates', () => {
      const axial: HexCoord = { q: 2, r: 3 };
      const cube = axialToCube(axial);
      
      expect(cube.q).toBe(2);
      expect(cube.r).toBe(3);
      expect(cube.s).toBe(-5); // s = -q-r
    });
    
    it('should handle negative coordinates', () => {
      const axial: HexCoord = { q: -1, r: -2 };
      const cube = axialToCube(axial);
      
      expect(cube.q).toBe(-1);
      expect(cube.r).toBe(-2);
      expect(cube.s).toBe(3); // s = -q-r
    });
    
    it('should preserve the constraint q + r + s = 0', () => {
      const testCases: HexCoord[] = [
        { q: 0, r: 0 },
        { q: 3, r: -1 },
        { q: -2, r: 5 },
        { q: -3, r: -4 }
      ];
      
      testCases.forEach(axial => {
        const cube = axialToCube(axial);
        expect(cube.q + cube.r + cube.s).toBe(0);
      });
    });
  });
  
  // Test cubeToAxial conversion
  describe('cubeToAxial', () => {
    it('should convert cube coordinates to axial coordinates', () => {
      const cube = { q: 2, r: 3, s: -5 };
      const axial = cubeToAxial(cube);
      
      expect(axial.q).toBe(2);
      expect(axial.r).toBe(3);
    });
    
    it('should handle negative coordinates', () => {
      const cube = { q: -1, r: -2, s: 3 };
      const axial = cubeToAxial(cube);
      
      expect(axial.q).toBe(-1);
      expect(axial.r).toBe(-2);
    });
    
    it('should be the inverse of axialToCube', () => {
      const testCases: HexCoord[] = [
        { q: 0, r: 0 },
        { q: 3, r: -1 },
        { q: -2, r: 5 },
        { q: -3, r: -4 }
      ];
      
      testCases.forEach(original => {
        const cube = axialToCube(original);
        const axial = cubeToAxial(cube);
        
        expect(axial.q).toBe(original.q);
        expect(axial.r).toBe(original.r);
      });
    });
  });
  
  // Test hex position calculation
  describe('getHexPosition', () => {
    it('should calculate 3D position from axial coordinates', () => {
      const coord: HexCoord = { q: 2, r: 3 };
      const size = 1;
      const [x, y, z] = getHexPosition(coord, size);
      
      // Hex position calculations based on the flat-topped hex layout algorithm
      expect(x).toBeCloseTo(3); // 1.5 * q
      expect(y).toBe(0); // Always 0 for flat hex grid
      expect(z).toBeCloseTo(6.062); // √3/2 * q + √3 * r
    });
    
    it('should scale position based on size parameter', () => {
      const coord: HexCoord = { q: 1, r: 1 };
      const size = 2;
      const [x, y, z] = getHexPosition(coord, size);
      const [smallX, smallY, smallZ] = getHexPosition(coord, 1);
      
      expect(x).toBe(smallX * 2);
      expect(y).toBe(smallY * 2);
      expect(z).toBe(smallZ * 2);
    });
    
    it('should handle negative coordinates', () => {
      const coord: HexCoord = { q: -1, r: -2 };
      const [x, y, z] = getHexPosition(coord);
      
      expect(x).toBeLessThan(0);
      expect(y).toBe(0);
      expect(z).toBeLessThan(0);
    });
  });
  
  // Test hex distance calculation
  describe('getHexDistance', () => {
    it('should calculate the correct distance between hexes', () => {
      const a: HexCoord = { q: 0, r: 0 };
      const b: HexCoord = { q: 3, r: 0 };
      
      expect(getHexDistance(a, b)).toBe(3);
    });
    
    it('should be symmetric (distance a to b equals distance b to a)', () => {
      const a: HexCoord = { q: 1, r: 2 };
      const b: HexCoord = { q: -2, r: 5 };
      
      expect(getHexDistance(a, b)).toBe(getHexDistance(b, a));
    });
    
    it('should handle diagonal movement', () => {
      const a: HexCoord = { q: 0, r: 0 };
      const b: HexCoord = { q: 2, r: 2 };
      
      // In axial coordinates, this is a diagonal that requires 4 steps
      expect(getHexDistance(a, b)).toBe(4);
    });
    
    it('should handle negative coordinates', () => {
      const a: HexCoord = { q: -1, r: -1 };
      const b: HexCoord = { q: -4, r: -3 };
      
      expect(getHexDistance(a, b)).toBe(5);
    });
  });
  
  // Test getting hex neighbors
  describe('getHexNeighbors', () => {
    it('should return 6 neighbors for a hex', () => {
      const coord: HexCoord = { q: 0, r: 0 };
      const neighbors = getHexNeighbors(coord);
      
      expect(neighbors.length).toBe(6);
    });
    
    it('should return neighbors at distance 1', () => {
      const coord: HexCoord = { q: 0, r: 0 };
      const neighbors = getHexNeighbors(coord);
      
      neighbors.forEach(neighbor => {
        expect(getHexDistance(coord, neighbor)).toBe(1);
      });
    });
    
    it('should return the correct neighbor positions', () => {
      const coord: HexCoord = { q: 0, r: 0 };
      const neighbors = getHexNeighbors(coord);
      
      // Expected directions: E, NE, NW, W, SW, SE
      const expectedDirections = [
        { q: 1, r: 0 },
        { q: 1, r: -1 },
        { q: 0, r: -1 },
        { q: -1, r: 0 },
        { q: -1, r: 1 },
        { q: 0, r: 1 }
      ];
      
      expectedDirections.forEach(expected => {
        expect(neighbors.some(n => n.q === expected.q && n.r === expected.r)).toBe(true);
      });
    });
  });
  
  // Test getting hexes in range
  describe('getHexesInRange', () => {
    it('should return only the center hex for range 0', () => {
      const center: HexCoord = { q: 0, r: 0 };
      const inRange = getHexesInRange(center, 0);
      
      expect(inRange.length).toBe(1);
      expect(inRange[0].q).toBe(center.q);
      expect(inRange[0].r).toBe(center.r);
    });
    
    it('should return 7 hexes for range 1 (center + 6 neighbors)', () => {
      const center: HexCoord = { q: 0, r: 0 };
      const inRange = getHexesInRange(center, 1);
      
      expect(inRange.length).toBe(7); // Center + 6 neighbors
    });
    
    it('should include all hexes at the specified range', () => {
      const center: HexCoord = { q: 0, r: 0 };
      const range = 2;
      const inRange = getHexesInRange(center, range);
      
      inRange.forEach(hex => {
        expect(getHexDistance(center, hex)).toBeLessThanOrEqual(range);
      });
    });
    
    it('should include the correct number of hexes for range 2', () => {
      // For a flat-topped hex grid:
      // Range 0: 1 hex (center)
      // Range 1: 6 hexes (ring 1)
      // Range 2: 12 hexes (ring 2)
      // Total for range 2: 1 + 6 + 12 = 19 hexes
      const center: HexCoord = { q: 0, r: 0 };
      const inRange = getHexesInRange(center, 2);
      
      expect(inRange.length).toBe(19);
    });
    
    it('should work with non-origin centers', () => {
      const center: HexCoord = { q: 2, r: -3 };
      const inRange = getHexesInRange(center, 1);
      
      expect(inRange.length).toBe(7);
      inRange.forEach(hex => {
        expect(getHexDistance(center, hex)).toBeLessThanOrEqual(1);
      });
    });
  });
  
  // Test finding hex by coordinates
  describe('findHexByCoord', () => {
    const hexGrid: HexTile[] = [
      { id: '0,0', coord: { q: 0, r: 0 }, type: 'normal', elevation: 0 },
      { id: '1,0', coord: { q: 1, r: 0 }, type: 'normal', elevation: 0 },
      { id: '0,1', coord: { q: 0, r: 1 }, type: 'blocked', elevation: 0.5 }
    ];
    
    it('should find a hex by its coordinates', () => {
      const coord: HexCoord = { q: 1, r: 0 };
      const hex = findHexByCoord(hexGrid, coord);
      
      expect(hex).toBeDefined();
      expect(hex?.id).toBe('1,0');
    });
    
    it('should return undefined for coordinates not in the grid', () => {
      const coord: HexCoord = { q: 2, r: 2 };
      const hex = findHexByCoord(hexGrid, coord);
      
      expect(hex).toBeUndefined();
    });
    
    it('should distinguish between different types of hexes', () => {
      const coord: HexCoord = { q: 0, r: 1 };
      const hex = findHexByCoord(hexGrid, coord);
      
      expect(hex).toBeDefined();
      expect(hex?.type).toBe('blocked');
      expect(hex?.elevation).toBe(0.5);
    });
  });
  
  // Test comparing hex coordinates
  describe('areHexCoordsEqual', () => {
    it('should return true for identical coordinates', () => {
      const a: HexCoord = { q: 1, r: 2 };
      const b: HexCoord = { q: 1, r: 2 };
      
      expect(areHexCoordsEqual(a, b)).toBe(true);
    });
    
    it('should return false for different coordinates', () => {
      const a: HexCoord = { q: 1, r: 2 };
      const b: HexCoord = { q: 1, r: 3 };
      
      expect(areHexCoordsEqual(a, b)).toBe(false);
    });
    
    it('should handle negative coordinates', () => {
      const a: HexCoord = { q: -1, r: -2 };
      const b: HexCoord = { q: -1, r: -2 };
      
      expect(areHexCoordsEqual(a, b)).toBe(true);
    });
    
    it('should work with references to the same object', () => {
      const a: HexCoord = { q: 0, r: 0 };
      
      expect(areHexCoordsEqual(a, a)).toBe(true);
    });
  });
});
