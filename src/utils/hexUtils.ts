import { HexCoord, HexTile } from '../types';

// Cube coordinates for hexagonal grid
type CubeCoord = {
  q: number; // x axis
  r: number; // z axis
  s: number; // y axis (derived: s = -q-r)
};

// Convert our simplified 2D axial coordinates to cube coordinates
export function axialToCube(coord: HexCoord): CubeCoord {
  return {
    q: coord.q,
    r: coord.r,
    s: -coord.q - coord.r
  };
}

// Convert cube coordinates back to axial
export function cubeToAxial(cube: CubeCoord): HexCoord {
  return {
    q: cube.q,
    r: cube.r
  };
}

// Get the 3D position for a hex at the given coordinates
export function getHexPosition(coord: HexCoord, size: number = 1): [number, number, number] {
  // Flat-topped hex layout
  const x = size * (3/2 * coord.q);
  const z = size * (Math.sqrt(3)/2 * coord.q + Math.sqrt(3) * coord.r);
  return [x, 0, z];
}

// Get hex distance between two coordinates
export function getHexDistance(a: HexCoord, b: HexCoord): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return Math.max(
    Math.abs(ac.q - bc.q),
    Math.abs(ac.r - bc.r),
    Math.abs(ac.s - bc.s)
  );
}

// Get neighbors for a hex
export function getHexNeighbors(coord: HexCoord): HexCoord[] {
  const directions = [
    { q: 1, r: 0 },  // E
    { q: 1, r: -1 }, // NE
    { q: 0, r: -1 }, // NW
    { q: -1, r: 0 }, // W
    { q: -1, r: 1 }, // SW
    { q: 0, r: 1 }   // SE
  ];
  
  return directions.map(dir => ({
    q: coord.q + dir.q,
    r: coord.r + dir.r
  }));
}

// Get all hexes within a given range
export function getHexesInRange(center: HexCoord, range: number): HexCoord[] {
  const results: HexCoord[] = [];
  
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range);
    const r2 = Math.min(range, -q + range);
    
    for (let r = r1; r <= r2; r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  
  return results;
}

// Find a hex by coordinates
export function findHexByCoord(hexes: HexTile[], coord: HexCoord): HexTile | undefined {
  return hexes.find(hex => hex.coord.q === coord.q && hex.coord.r === coord.r);
}

// Check if two coordinates are equal
export function areHexCoordsEqual(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}
