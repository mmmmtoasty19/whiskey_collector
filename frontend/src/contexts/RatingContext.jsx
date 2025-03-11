import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const RatingContext = createContext(null);

export function RatingProvider({ children }) {
  const [state, setState] = useState({
    userRatings: [],
    whiskeyRatings: [],
    isLoading: false,
    error: null
  });

  const getUserRatings = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.get('/api/ratings/user');
      
      setState(prev => ({
        ...prev,
        userRatings: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user ratings';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const getWhiskeyRatings = async (whiskeyId) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.get(`/api/ratings/whiskey/${whiskeyId}`);
      
      setState(prev => ({
        ...prev,
        whiskeyRatings: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch whiskey ratings';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const rateWhiskey = async (whiskeyId, ratingData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.post(`/api/ratings/whiskey/${whiskeyId}`, ratingData);
      
      setState(prev => {
        // Check if this is a new rating or an update
        const existingRatingIndex = prev.userRatings.findIndex(
          r => r.WhiskeyId === parseInt(whiskeyId)
        );
        
        let updatedUserRatings;
        
        if (existingRatingIndex >= 0) {
          // Update existing rating
          updatedUserRatings = [...prev.userRatings];
          updatedUserRatings[existingRatingIndex] = response.data;
        } else {
          // Add new rating
          updatedUserRatings = [...prev.userRatings, response.data];
        }
        
        return {
          ...prev,
          userRatings: updatedUserRatings,
          isLoading: false
        };
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to rate whiskey';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const deleteRating = async (id) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await axios.delete(`/api/ratings/${id}`);
      
      setState(prev => ({
        ...prev,
        userRatings: prev.userRatings.filter(r => r.id !== id),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete rating';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const getUserWhiskeyRating = (whiskeyId) => {
    return state.userRatings.find(r => r.WhiskeyId === parseInt(whiskeyId)) || null;
  };
  
  const getWhiskeyAverageRating = (whiskeyId) => {
    const ratings = state.whiskeyRatings.filter(r => r.WhiskeyId === parseInt(whiskeyId));
    let result = { average: 0, count: 0 };
    
    result.count = ratings.length;
    
    if (result.count > 0) {
      result.average = ratings.reduce((acc, curr) => acc + curr.score, 0) / result.count;
    }
    
    return result;
  };
  
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <RatingContext.Provider value={{
      ...state,
      getUserRatings,
      getWhiskeyRatings,
      rateWhiskey,
      deleteRating,
      getUserWhiskeyRating,
      getWhiskeyAverageRating,
      clearError
    }}>
      {children}
    </RatingContext.Provider>
  );
}

export function useRating() {
  return useContext(RatingContext);
}