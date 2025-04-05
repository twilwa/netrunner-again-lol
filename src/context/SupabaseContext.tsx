import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { HexTile, Territory, Card, Equipment } from '../types';

// Define types for Supabase context
type SupabaseContextType = {
  supabase: SupabaseClient;
  isLoading: boolean;
  error: Error | null;
  syncTerritories: (territories: Territory[]) => Promise<void>;
  fetchTerritories: () => Promise<Territory[]>;
  updateTerritory: (territory: Territory) => Promise<void>;
  fetchAvailableCards: () => Promise<Card[]>;
  fetchAvailableEquipment: () => Promise<Equipment[]>;
  recordGameEvent: (eventData: any) => Promise<void>;
  subscribeToTerritoryChanges: (callback: (territories: Territory[]) => void) => () => void;
};

// Create the context with default values
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Supabase Provider component
export function SupabaseProvider({ 
  children,
  supabaseClient
}: { 
  children: ReactNode;
  supabaseClient?: SupabaseClient;
}) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize Supabase client
  useEffect(() => {
    try {
      if (supabaseClient) {
        setSupabase(supabaseClient);
      } else {
        // In a real implementation, these would come from environment variables
        const SUPABASE_URL = 'https://example.supabase.co';
        const SUPABASE_ANON_KEY = 'your-anon-key';
        
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(client);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      setError(err instanceof Error ? err : new Error('Unknown error initializing Supabase'));
      setIsLoading(false);
    }
  }, [supabaseClient]);

  // Sync territories with Supabase
  const syncTerritories = async (territories: Territory[]) => {
    if (!supabase) return;
    
    try {
      // Upsert territories
      const { error } = await supabase
        .from('territories')
        .upsert(territories, { onConflict: 'id' });
        
      if (error) throw error;
    } catch (err) {
      console.error('Error syncing territories:', err);
      setError(err instanceof Error ? err : new Error('Unknown error syncing territories'));
    }
  };

  // Fetch territories from Supabase
  const fetchTerritories = async (): Promise<Territory[]> => {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('territories')
        .select('*')
        .order('id');
        
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching territories:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching territories'));
      return [];
    }
  };

  // Update a single territory
  const updateTerritory = async (territory: Territory): Promise<void> => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('territories')
        .update(territory)
        .eq('id', territory.id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error updating territory:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating territory'));
    }
  };

  // Fetch available cards from Supabase
  const fetchAvailableCards = async (): Promise<Card[]> => {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('cardTemplates')
        .select('*');
        
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching cards'));
      return [];
    }
  };

  // Fetch available equipment from Supabase
  const fetchAvailableEquipment = async (): Promise<Equipment[]> => {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('equipmentTemplates')
        .select('*');
        
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching equipment'));
      return [];
    }
  };

  // Record game events
  const recordGameEvent = async (eventData: any): Promise<void> => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('gameEvents')
        .insert({
          ...eventData,
          timestamp: new Date().toISOString(),
        });
        
      if (error) throw error;
    } catch (err) {
      console.error('Error recording game event:', err);
      setError(err instanceof Error ? err : new Error('Unknown error recording game event'));
    }
  };

  // Subscribe to territory changes using Supabase realtime
  const subscribeToTerritoryChanges = (callback: (territories: Territory[]) => void) => {
    if (!supabase) return () => {};
    
    const subscription = supabase
      .channel('territories-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'territories'
      }, async () => {
        // Fetch updated territories
        const territories = await fetchTerritories();
        callback(territories);
      })
      .subscribe();
      
    // Return unsubscribe function
    return () => {
      supabase.channel('territories-changes').unsubscribe();
    };
  };

  // Provide Supabase context to children
  return (
    <SupabaseContext.Provider value={{
      supabase: supabase as SupabaseClient,
      isLoading,
      error,
      syncTerritories,
      fetchTerritories,
      updateTerritory,
      fetchAvailableCards,
      fetchAvailableEquipment,
      recordGameEvent,
      subscribeToTerritoryChanges,
    }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Custom hook to use Supabase context
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
