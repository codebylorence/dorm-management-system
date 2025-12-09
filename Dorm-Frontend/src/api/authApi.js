import { apiRequest } from './config';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get current user from localStorage
export const getCurrentUserFromStorage = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

// Set current user in localStorage
export const setCurrentUserInStorage = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove current user from localStorage
export const removeCurrentUserFromStorage = () => {
  localStorage.removeItem('user');
};

// Register new user
export const register = async (userData) => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  if (response.token) {
    setToken(response.token);
    setCurrentUserInStorage(response.user);
  }
  
  return response;
};

// Login user
export const login = async (username, password) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  if (response.token) {
    setToken(response.token);
    setCurrentUserInStorage(response.user);
  }
  
  return response;
};

// Logout user
export const logout = async () => {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
    removeCurrentUserFromStorage();
  }
};

// Get current user from API
export const getCurrentUser = async () => {
  return await apiRequest('/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (response.user) {
    setCurrentUserInStorage(response.user);
  }
  
  return response;
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  return await apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
};

// Refresh token
export const refreshToken = async () => {
  const response = await apiRequest('/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  if (response.token) {
    setToken(response.token);
    setCurrentUserInStorage(response.user);
  }
  
  return response;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

