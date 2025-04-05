// Mock for three.js and related packages to avoid issues in tests
const mockThree = {
  Vector3: jest.fn(() => ({
    x: 0,
    y: 0,
    z: 0,
    set: jest.fn(),
    copy: jest.fn(),
    add: jest.fn(),
    sub: jest.fn(),
    multiply: jest.fn(),
    divide: jest.fn(),
    normalize: jest.fn(),
  })),
  Mesh: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  TextureLoader: jest.fn(() => ({
    load: jest.fn(() => ({
      wrapS: 0,
      wrapT: 0,
    })),
  })),
  Color: jest.fn(),
  Box3: jest.fn(() => ({
    setFromObject: jest.fn(),
    getSize: jest.fn(() => ({ x: 1, y: 1, z: 1 })),
  })),
  Raycaster: jest.fn(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn(() => []),
  })),
  Scene: jest.fn(),
  RepeatWrapping: 0,
};

export default mockThree;

// Also export individual components
export const Vector3 = mockThree.Vector3;
export const Mesh = mockThree.Mesh;
export const MeshStandardMaterial = mockThree.MeshStandardMaterial;
export const TextureLoader = mockThree.TextureLoader;
export const Color = mockThree.Color;
export const Box3 = mockThree.Box3;
export const Raycaster = mockThree.Raycaster;
export const Scene = mockThree.Scene;
export const RepeatWrapping = mockThree.RepeatWrapping;
