import { apiRequest } from './config';

// Get all users with optional filtering
export const getAllUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/users?${queryParams}` : '/users';
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

// Get single user by ID
export const getUserById = async (id) => {
  return await apiRequest(`/users/${id}`, {
    method: 'GET',
  });
};

// Create new user (Admin only)
export const createUser = async (userData) => {
  return await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Update user
export const updateUser = async (id, userData) => {
  return await apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// Update user role (Admin only)
export const updateUserRole = async (id, role) => {
  return await apiRequest(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
};

// Delete user (Admin only)
export const deleteUser = async (id) => {
  return await apiRequest(`/users/${id}`, {
    method: 'DELETE',
  });
};

