import { apiRequest } from './config';

// Get all settings
export const getAllSettings = async () => {
  return await apiRequest('/settings', {
    method: 'GET',
  });
};

// Get single setting by key
export const getSettingByKey = async (key) => {
  return await apiRequest(`/settings/${key}`, {
    method: 'GET',
  });
};

// Update single setting
export const updateSetting = async (key, value, type = 'string', description = '', category = 'general') => {
  return await apiRequest(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ key, value, type, description, category }),
  });
};

// Update multiple settings
export const updateMultipleSettings = async (settings) => {
  return await apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
};

// Delete setting
export const deleteSetting = async (key) => {
  return await apiRequest(`/settings/${key}`, {
    method: 'DELETE',
  });
};

// Initialize default settings
export const initializeDefaultSettings = async () => {
  return await apiRequest('/settings/initialize', {
    method: 'POST',
  });
};