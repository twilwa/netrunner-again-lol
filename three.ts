// Mock Three.js library for testing
const mockThree = {
  Object3D: class {
    visible = true;
    position = { x: 0, y: 0, z: 0 };
    rotation = { x: 0, y: 0, z: 0 };
    scale = { x: 1, y: 1, z: 1 };
    children = [];
    add() {}
    remove() {}
  },
  Scene: class {
    children = [];
    add() {}
    remove() {}
  },
  Vector3: class {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    x = 0;
    y = 0;
    z = 0;
    set() { return this; }
    copy() { return this; }
    add() { return this; }
    sub() { return this; }
    multiplyScalar() { return this; }
  },
  Euler: class {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    x = 0;
    y = 0;
    z = 0;
  },
  Mesh: class {
    constructor() {
      this.position = { x: 0, y: 0, z: 0 };
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scale = { x: 1, y: 1, z: 1 };
    }
    position = { x: 0, y: 0, z: 0 };
    rotation = { x: 0, y: 0, z: 0 };
    scale = { x: 1, y: 1, z: 1 };
    material = {};
    geometry = {};
  },
  Material: class {},
  MeshBasicMaterial: class {},
  MeshStandardMaterial: class {},
  Color: class {
    constructor(color: any) {
      this.color = color;
    }
    color: any;
  },
  BufferGeometry: class {},
  BoxGeometry: class {},
  CylinderGeometry: class {},
  SphereGeometry: class {},
  TextureLoader: class {
    load() {
      return {
        wrapS: 0,
        wrapT: 0,
      };
    }
  },
  RepeatWrapping: 0,
  LinearFilter: 0,
  FrontSide: 0,
  BackSide: 0,
  DoubleSide: 0,
  Math: {
    degToRad: (degrees: number) => degrees * (Math.PI / 180),
  }
};

module.exports = mockThree;
