// API Base URL Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default headers for API requests
export const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Generic API request handler
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add authentication token to headers if available
  const token = getAuthToken();
  const headers = { ...defaultHeaders };
  
  if (token && !options.headers?.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const config = {
    headers: { ...headers, ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Backend Error Details:', error);
      
      // Handle unauthorized (token expired or invalid)
      if (response.status === 401) {
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page if needed
        // window.location.href = '/login';
      }
      
      throw new Error(error.message || error.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
