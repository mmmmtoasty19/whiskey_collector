import { writable } from 'svelte/store';
import axios from 'axios';

// Initial state
const initialState = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null
};

// Create store
const createAuthStore = () => {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // Register a new user
    register: async (username, email, password) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.post('/api/auth/register', {
          username,
          email,
          password
        });
        
        const { token, user } = response.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Login user
    login: async (email, password) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await axios.post('/api/auth/login', {
          email,
          password
        });
        
        const { token, user } = response.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, message: errorMessage };
      }
    },
    
    // Logout user
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Remove axios default headers
      delete axios.defaults.headers.common['Authorization'];
      
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    },
    
    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
};

// Create and export the store
export const authStore = createAuthStore();

// Set axios default headers on initialization
if (initialState.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialState.token}`;
}