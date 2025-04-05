import {
  getHexPosition,
  getHexDistance,
  getHexNeighbors,
  getHexesInRange,
  findHexByCoord,
  areHexCoordsEqual,
  axialToCube,
  cubeToAxial
} from '../../utils/hexUtils';
import { HexTile } from '../../types';

describe('Hex Utility Functions', () => {
  describe('coordinate conversions', () => {
    test('axialToCube converts axial coordinates to cube coordinates', () => {
      const axial = { q: 2, r: -1 };
      const cube = axialToCube(axial);
      expect(cube).toEqual({ q: 2, r: -1, s: -1 });
    });

    test('cubeToAxial converts cube coordinates to axial coordinates', () => {
      const cube = { q: 2, r: -1, s: -1 };
      const axial = cubeToAxial(cube);
      expect(axial).toEqual({ q: 2, r: -1 });
    });
  });

  describe('getHexPosition', () => {
    test('converts axial coordinates to 3D position', () => {
      const coord = { q: 1, r: -1 };
      const position = getHexPosition(coord);
      
      // Using approximate matching for floating-point calculations
      expect(position[0]).toBeCloseTo(1.5); // x
      expect(position[1]).toBeCloseTo(0);   // y
      expect(position[2]).toBeCloseTo(-0.866, 2); // z (approximated due to sqrt(3))
    });

    test('scales position based on size parameter', () => {
      const coord = { q: 1, r: 0 };
      const size = 2;
      const position = getHexPosition(coord, size);
      
      expect(position[0]).toBeCloseTo(3); // x = size * 3/2 * q
      expect(position[1]).toBeCloseTo(0); // y 
      expect(position[2]).toBeCloseTo(1.732, 2); // z = size * sqrt(3)/2 * q
    });
  });

  describe('getHexDistance', () => {
    test('calculates the distance between two hexes', () => {
      const a = { q: 0, r: 0 };
      const b = { q: 2, r: -2 };
      
      expect(getHexDistance(a, b)).toBe(2);
    });

    test('returns 0 for the same coordinates', () => {
      const a = { q: 3, r: -1 };
      const b = { q: 3, r: -1 };
      
      expect(getHexDistance(a, b)).toBe(0);
    });

    test('handles negative coordinates correctly', () => {
      const a = { q: -1, r: -2 };
      const b = { q: -3, r: 1 };
      
      expect(getHexDistance(a, b)).toBe(3);
    });
  });

  describe('getHexNeighbors', () => {
    test('returns the six neighbors of a hex', () => {
      const center = { q: 0, r: 0 };
      const neighbors = getHexNeighbors(center);
      
      expect(neighbors).toHaveLength(6);
      expect(neighbors).toContainEqual({ q: 1, r: 0 });  // E
      expect(neighbors).toContainEqual({ q: 1, r: -1 }); // NE
      expect(neighbors).toContainEqual({ q: 0, r: -1 }); // NW
      expect(neighbors).toContainEqual({ q: -1, r: 0 }); // W
      expect(neighbors).toContainEqual({ q: -1, r: 1 }); // SW
      expect(neighbors).toContainEqual({ q: 0, r: 1 });  // SE
    });
  });

  describe('getHexesInRange', () => {
    test('returns the center hex for range 0', () => {
      const center = { q: 0, r: 0 };
      const result = getHexesInRange(center, 0);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(center);
    });

    test('returns 7 hexes for range 1', () => {
      const center = { q: 0, r: 0 };
      const result = getHexesInRange(center, 1);
      
      expect(result).toHaveLength(7); // center + 6 neighbors
      expect(result).toContainEqual(center);
      expect(result).toContainEqual({ q: 1, r: 0 });
      expect(result).toContainEqual({ q: 1, r: -1 });
      expect(result).toContainEqual({ q: 0, r: -1 });
      expect(result).toContainEqual({ q: -1, r: 0 });
      expect(result).toContainEqual({ q: -1, r: 1 });
      expect(result).toContainEqual({ q: 0, r: 1 });
    });

    test('works with non-origin centers', () => {
      const center = { q: 2, r: -1 };
      const result = getHexesInRange(center, 1);
      
      expect(result).toHaveLength(7);
      expect(result).toContainEqual(center);
      expect(result).toContainEqual({ q: 3, r: -1 });
      expect(result).toContainEqual({ q: 3, r: -2 });
      expect(result).toContainEqual({ q: 2, r: -2 });
      expect(result).toContainEqual({ q: 1, r: -1 });
      expect(result).toContainEqual({ q: 1, r: 0 });
      expect(result).toContainEqual({ q: 2, r: 0 });
    });
  });

  describe('findHexByCoord', () => {
    const hexGrid: HexTile[] = [
      { id: '0,0', coord: { q: 0, r: 0 }, type: 'normal', elevation: 0, influenceLevel: 50 },
      { id: '1,0', coord: { q: 1, r: 0 }, type: 'normal', elevation: 0, influenceLevel: 50 },
      { id: '0,1', coord: { q: 0, r: 1 }, type: 'blocked', elevation: 1, influenceLevel: 50 }
    ];

    test('finds a hex by its coordinates', () => {
      const result = findHexByCoord(hexGrid, { q: 1, r: 0 });
      expect(result).toBeDefined();
      expect(result?.id).toBe('1,0');
    });

    test('returns undefined for non-existent coordinates', () => {
      const result = findHexByCoord(hexGrid, { q: 5, r: 5 });
      expect(result).toBeUndefined();
    });
  });

  describe('areHexCoordsEqual', () => {
    test('returns true for equal coordinates', () => {
      const a = { q: 2, r: -1 };
      const b = { q: 2, r: -1 };
      
      expect(areHexCoordsEqual(a, b)).toBe(true);
    });

    test('returns false for different coordinates', () => {
      const a = { q: 2, r: -1 };
      const b = { q: 2, r: 0 };
      
      expect(areHexCoordsEqual(a, b)).toBe(false);
    });
  });
});
