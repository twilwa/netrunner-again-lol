import '@testing-library/jest-dom';

// Suppress console errors during tests
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock window.matchMedia for responsive design tests
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return false; },
  };
};

// Mock IntersectionObserver for components that rely on it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock requestAnimationFrame for animations
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};

// Create a mock for localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
