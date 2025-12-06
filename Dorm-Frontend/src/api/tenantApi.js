import { apiRequest } from './config';

// Get all tenants
export const getAllTenants = async () => {
  return await apiRequest('/tenants', {
    method: 'GET',
  });
};

// Get single tenant by ID
export const getTenantById = async (id) => {
  return await apiRequest(`/tenants/${id}`, {
    method: 'GET',
  });
};

// Create new tenant
export const createTenant = async (tenantData) => {
  return await apiRequest('/tenants', {
    method: 'POST',
    body: JSON.stringify(tenantData),
  });
};

// Update tenant
export const updateTenant = async (id, tenantData) => {
  return await apiRequest(`/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tenantData),
  });
};

// Delete tenant
export const deleteTenant = async (id) => {
  return await apiRequest(`/tenants/${id}`, {
    method: 'DELETE',
  });
};
