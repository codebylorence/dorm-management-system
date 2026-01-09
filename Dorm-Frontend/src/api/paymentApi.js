import { apiRequest } from './config';

// Get all payments with optional filtering
export const getAllPayments = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/payments?${queryParams}` : '/payments';
  
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

// Get single payment by ID
export const getPaymentById = async (id) => {
  return await apiRequest(`/payments/${id}`, {
    method: 'GET',
  });
};

// Get payments by tenant ID
export const getPaymentsByTenant = async (tenantId) => {
  return await apiRequest(`/payments/tenant/${tenantId}`, {
    method: 'GET',
  });
};

// Get payments by unit number
export const getPaymentsByUnit = async (unitNumber) => {
  return await apiRequest(`/payments/unit/${unitNumber}`, {
    method: 'GET',
  });
};

// Get payment statistics for dashboard
export const getPaymentStatistics = async () => {
  return await apiRequest('/payments/statistics', {
    method: 'GET',
  });
};

// Get overdue payments
export const getOverduePayments = async () => {
  return await apiRequest('/payments/overdue', {
    method: 'GET',
  });
};

// Create new payment
export const createPayment = async (paymentData) => {
  return await apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  });
};

// Update payment
export const updatePayment = async (id, paymentData) => {
  return await apiRequest(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(paymentData),
  });
};

// Delete payment
export const deletePayment = async (id) => {
  return await apiRequest(`/payments/${id}`, {
    method: 'DELETE',
  });
};

// Update overdue payments
export const updateOverduePayments = async () => {
  return await apiRequest('/payments/update-overdue', {
    method: 'PUT',
  });
};

