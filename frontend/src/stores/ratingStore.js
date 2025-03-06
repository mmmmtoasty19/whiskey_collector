import { writable } from 'svelte/store';
import axios from 'axios';

// Create store
const createRatingStore = () => {
  const { subscribe, set, update } = writable({
    userRatings: [],
    whiskeyRatings: [],
    isLoading: false,
    error: null
  });

  return {
    subscribe,
    
    // Get user ratings
    getUserRatings: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.get('/api/ratings/user');
        
        update(state => ({
          ...state,
          userRatings: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch user ratings';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Get whiskey ratings
    getWhiskeyRatings: async (whiskeyId) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.get(`/api/ratings/whiskey/${whiskeyId}`);
        
        update(state => ({
          ...state,
          whiskeyRatings: response.data,
          isLoading: false
        }));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch whiskey ratings';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Rate whiskey
    rateWhiskey: async (whiskeyId, ratingData) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.post(`/api/ratings/whiskey/${whiskeyId}`, ratingData);
        
        update(state => {
          // Check if this is a new rating or an update
          const existingRatingIndex = state.userRatings.findIndex(
            r => r.WhiskeyId === whiskeyId
          );
          
          let updatedUserRatings;
          
          if (existingRatingIndex >= 0) {
            // Update existing rating
            updatedUserRatings = [...state.userRatings];
            updatedUserRatings[existingRatingIndex] = response.data;
          } else {
            // Add new rating
            updatedUserRatings = [...state.userRatings, response.data];
          }
          
          return {
            ...state,
            userRatings: updatedUserRatings,
            isLoading: false
          };
        });
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to rate whiskey';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Delete rating
    deleteRating: async (id) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        await axios.delete(`/api/ratings/${id}`);
        
        update(state => ({
          ...state,
          userRatings: state.userRatings.filter(r => r.id !== id),
          isLoading: false
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete rating';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Get user rating for specific whiskey
    getUserWhiskeyRating: (whiskeyId) => {
      let result = null;
      
      update(state => {
        result = state.userRatings.find(r => r.WhiskeyId === whiskeyId) || null;
        return state;
      });
      
      return result;
    },
    
    // Calculate average rating for whiskey
    getWhiskeyAverageRating: (whiskeyId) => {
      let result = { average: 0, count: 0 };
      
      update(state => {
        const ratings = state.whiskeyRatings.filter(r => r.WhiskeyId === whiskeyId);
        result.count = ratings.length;
        
        if (result.count > 0) {
          result.average = ratings.reduce((acc, curr) => acc + curr.score, 0) / result.count;
        }
        
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
export const ratingStore = createRatingStore();