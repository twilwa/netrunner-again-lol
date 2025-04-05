// Mock Supabase client for testing
import { v4 as uuidv4 } from 'uuid';

// Mock storage for holding data between test operations
const mockStorage = {
  territories: [],
  playerStates: [],
  gameEvents: [],
  cardTemplates: [],
  equipmentTemplates: [],
};

// Type definitions to help with testing
export type SupabaseTable = 'territories' | 'playerStates' | 'gameEvents' | 'cardTemplates' | 'equipmentTemplates';

export const mockSupabase = {
  // Authentication functions
  auth: {
    signUp: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: { user: { id: uuidv4() } },
        error: null,
      });
    }),
    signIn: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: { user: { id: uuidv4() } },
        error: null,
      });
    }),
    signOut: jest.fn().mockImplementation(() => {
      return Promise.resolve({ error: null });
    }),
    getSession: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: { session: { user: { id: uuidv4() } } },
        error: null,
      });
    }),
  },
  
  // Storage functions
  storage: {
    from: jest.fn().mockImplementation(() => {
      return {
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com' } }),
      };
    }),
  },
  
  // Database functions
  from: jest.fn().mockImplementation((table: SupabaseTable) => ({
    select: jest.fn().mockImplementation(() => {
      return {
        eq: jest.fn().mockImplementation((column, value) => {
          return {
            data: mockStorage[table].filter((item: any) => item[column] === value),
            error: null,
          };
        }),
        order: jest.fn().mockImplementation(() => {
          return {
            data: mockStorage[table],
            error: null,
          };
        }),
        data: mockStorage[table],
        error: null,
      };
    }),
    insert: jest.fn().mockImplementation((newData) => {
      const dataWithId = Array.isArray(newData) 
        ? newData.map(item => ({ ...item, id: item.id || uuidv4() }))
        : { ...newData, id: newData.id || uuidv4() };
      
      if (Array.isArray(dataWithId)) {
        mockStorage[table] = [...mockStorage[table], ...dataWithId];
      } else {
        mockStorage[table] = [...mockStorage[table], dataWithId];
      }
      
      return {
        data: dataWithId,
        error: null,
      };
    }),
    update: jest.fn().mockImplementation((updates) => {
      return {
        eq: jest.fn().mockImplementation((column, value) => {
          mockStorage[table] = mockStorage[table].map((item: any) => {
            if (item[column] === value) {
              return { ...item, ...updates };
            }
            return item;
          });
          
          return {
            data: mockStorage[table].find((item: any) => item[column] === value),
            error: null,
          };
        }),
      };
    }),
    delete: jest.fn().mockImplementation(() => {
      return {
        eq: jest.fn().mockImplementation((column, value) => {
          const filteredItems = mockStorage[table].filter((item: any) => item[column] !== value);
          mockStorage[table] = filteredItems;
          
          return {
            data: [],
            error: null,
          };
        }),
      };
    }),
  })),
  
  // Realtime functions
  channel: jest.fn().mockImplementation((channel) => {
    return {
      on: jest.fn().mockImplementation((event, callback) => {
        // Store callback for testing
        return {
          subscribe: jest.fn().mockImplementation(() => {
            return { channel, event, callback };
          }),
        };
      }),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
  }),
  
  // Utility function to reset the mock storage
  _reset: () => {
    mockStorage.territories = [];
    mockStorage.playerStates = [];
    mockStorage.gameEvents = [];
    mockStorage.cardTemplates = [];
    mockStorage.equipmentTemplates = [];
  },
  
  // Utility function to seed with test data
  _seed: (table: SupabaseTable, data: any[]) => {
    mockStorage[table] = [...data];
  },
};

export default mockSupabase;
