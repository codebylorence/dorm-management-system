import { apiRequest } from './config';

// Get all units
export const getAllUnits = async () => {
  return await apiRequest('/units', {
    method: 'GET',
  });
};

// Get single unit by ID
export const getUnitById = async (id) => {
  return await apiRequest(`/units/${id}`, {
    method: 'GET',
  });
};

// Create new unit
export const createUnit = async (unitData) => {
  return await apiRequest('/units', {
    method: 'POST',
    body: JSON.stringify(unitData),
  });
};

// Update unit
export const updateUnit = async (id, unitData) => {
  return await apiRequest(`/units/${id}`, {
    method: 'PUT',
    body: JSON.stringify(unitData),
  });
};

// Delete unit
export const deleteUnit = async (id) => {
  return await apiRequest(`/units/${id}`, {
    method: 'DELETE',
  });
};
