import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const WhiskeyContext = createContext(null);

export function WhiskeyProvider({ children }) {
  const [state, setState] = useState({
    whiskies: [],
    currentWhiskey: null,
    isLoading: false,
    error: null
  });

  const getAllWhiskies = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.get('/api/whiskies');
      
      setState(prev => ({
        ...prev,
        whiskies: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch whiskies';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const getWhiskeyById = async (id) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.get(`/api/whiskies/${id}`);
      
      setState(prev => ({
        ...prev,
        currentWhiskey: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch whiskey';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };

  // Add other functions similar to your Svelte store: createWhiskey, updateWhiskey, deleteWhiskey, searchWhiskies

  return (
    <WhiskeyContext.Provider value={{
      ...state,
      getAllWhiskies,
      getWhiskeyById,
      // Include other functions
    }}>
      {children}
    </WhiskeyContext.Provider>
  );
}

export function useWhiskey() {
  return useContext(WhiskeyContext);
}