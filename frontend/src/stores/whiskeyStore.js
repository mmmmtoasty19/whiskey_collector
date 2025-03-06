import { writable } from 'svelte/store';
import axios from 'axios';

// Create store
const createWhiskeyStore = () => {
  const { subscribe, set, update } = writable({
    whiskies: [],
    currentWhiskey: null,
    isLoading: false,
    error: null
  });

  return {
    subscribe,
    
    // Get all whiskies
    getAllWhiskies: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.get('/api/whiskies');
        
        update(state => ({
          ...state,
          whiskies: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch whiskies';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Get whiskey by ID
    getWhiskeyById: async (id) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.get(`/api/whiskies/${id}`);
        
        update(state => ({
          ...state,
          currentWhiskey: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch whiskey';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Create new whiskey
    createWhiskey: async (whiskeyData) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.post('/api/whiskies', whiskeyData);
        
        update(state => ({
          ...state,
          whiskies: [...state.whiskies, response.data],
          currentWhiskey: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to create whiskey';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Update whiskey
    updateWhiskey: async (id, whiskeyData) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.put(`/api/whiskies/${id}`, whiskeyData);
        
        update(state => ({
          ...state,
          whiskies: state.whiskies.map(w => 
            w.id === id ? response.data : w
          ),
          currentWhiskey: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update whiskey';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Delete whiskey
    deleteWhiskey: async (id) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        await axios.delete(`/api/whiskies/${id}`);
        
        update(state => ({
          ...state,
          whiskies: state.whiskies.filter(w => w.id !== id),
          currentWhiskey: state.currentWhiskey?.id === id ? null : state.currentWhiskey,
          isLoading: false
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete whiskey';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Search whiskies
    searchWhiskies: async (params) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.get('/api/whiskies/search', { params });
        
        update(state => ({
          ...state,
          whiskies: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Search failed';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Clear current whiskey
    clearCurrentWhiskey: () => {
      update(state => ({ ...state, currentWhiskey: null }));
    },
    
    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
};

// Create and export the store
export const whiskeyStore = createWhiskeyStore();