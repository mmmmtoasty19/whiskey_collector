import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const CollectionContext = createContext(null);

export function CollectionProvider({ children }) {
  const [state, setState] = useState({
    collection: [],
    isLoading: false,
    error: null
  });

  const getUserCollection = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.get('/api/collection');
      
      setState(prev => ({
        ...prev,
        collection: response.data,
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch collection';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const addToCollection = async (collectionData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.post('/api/collection', collectionData);
      
      setState(prev => ({
        ...prev,
        collection: [...prev.collection, response.data],
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add to collection';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const updateCollectionEntry = async (id, collectionData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await axios.put(`/api/collection/${id}`, collectionData);
      
      setState(prev => ({
        ...prev,
        collection: prev.collection.map(entry => 
          entry.id === id ? response.data : entry
        ),
        isLoading: false
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update collection entry';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const removeFromCollection = async (id) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await axios.delete(`/api/collection/${id}`);
      
      setState(prev => ({
        ...prev,
        collection: prev.collection.filter(entry => entry.id !== id),
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove from collection';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, message: errorMessage };
    }
  };
  
  const isInCollection = (whiskeyId) => {
    return state.collection.some(entry => entry.Whiskey.id === whiskeyId);
  };
  
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <CollectionContext.Provider value={{
      ...state,
      getUserCollection,
      addToCollection,
      updateCollectionEntry,
      removeFromCollection,
      isInCollection,
      clearError
    }}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  return useContext(CollectionContext);
}