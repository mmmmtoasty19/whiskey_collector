import { writable } from 'svelte/store';
import axios from 'axios';

// Create store
const createCollectionStore = () => {
  const { subscribe, set, update } = writable({
    collection: [],
    isLoading: false,
    error: null
  });

  return {
    subscribe,
    
    // Get user's collection
    getUserCollection: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.get('/api/collection');
        
        update(state => ({
          ...state,
          collection: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch collection';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Add whiskey to collection
    addToCollection: async (collectionData) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.post('/api/collection', collectionData);
        
        update(state => ({
          ...state,
          collection: [...state.collection, response.data],
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to add to collection';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Update collection entry
    updateCollectionEntry: async (id, collectionData) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.put(`/api/collection/${id}`, collectionData);
        
        update(state => ({
          ...state,
          collection: state.collection.map(entry => 
            entry.id === id ? response.data : entry
          ),
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update collection entry';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Remove from collection
    removeFromCollection: async (id) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        await axios.delete(`/api/collection/${id}`);
        
        update(state => ({
          ...state,
          collection: state.collection.filter(entry => entry.id !== id),
          isLoading: false
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to remove from collection';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Check if whiskey is in collection
    isInCollection: (whiskeyId) => {
      let result = false;
      
      update(state => {
        result = state.collection.some(entry => entry.Whiskey.id === whiskeyId);
        return state;
      });
      
      return result;
    },
    
    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
};

// Create and export the store
export const collectionStore = createCollectionStore();