import { createClient } from '@supabase/supabase-js';

// Create a mock of the Supabase client for tests
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        data: null,
        error: null,
      })),
      data: null,
      error: null,
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: null, error: null })),
      data: null,
      error: null,
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      match: jest.fn(() => Promise.resolve({ data: null, error: null })),
      data: null,
      error: null,
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      match: jest.fn(() => Promise.resolve({ data: null, error: null })),
      data: null,
      error: null,
    })),
  })),
  auth: {
    signUp: jest.fn(() => Promise.resolve({ user: null, session: null, error: null })),
    signIn: jest.fn(() => Promise.resolve({ user: null, session: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
      getPublicUrl: jest.fn(() => ({ publicURL: 'https://example.com/image.png' })),
    })),
  },
  // For realtime subscriptions
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => Promise.resolve()),
    })),
  })),
};

// Mock the createClient function to return our mock
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Utility to reset all mocks between tests
export const resetSupabaseMocks = () => {
  Object.values(mockSupabaseClient).forEach((method) => {
    if (typeof method === 'function') {
      (method as jest.Mock).mockClear();
    }
  });
  
  // Clear the mock of createClient itself
  (createClient as jest.Mock).mockClear();
};

export default mockSupabaseClient;
