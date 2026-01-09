import { createContext, useContext, useState, useEffect } from 'react';
import { getAllSettings } from '../api';

const SystemContext = createContext(null);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

export const SystemProvider = ({ children }) => {
  const [systemSettings, setSystemSettings] = useState({
    systemName: 'Dorm Management System',
    version: '1.0.0',
    contactEmail: 'admin@dorm.com',
    contactPhone: '+63 123 456 7890',
    address: '123 Dormitory Street, City, Country'
  });
  const [loading, setLoading] = useState(true);

  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      const settings = await getAllSettings();
      setSystemSettings({
        systemName: settings.systemName || 'Dorm Management System',
        version: settings.version || '1.0.0',
        contactEmail: settings.contactEmail || 'admin@dorm.com',
        contactPhone: settings.contactPhone || '+63 123 456 7890',
        address: settings.address || '123 Dormitory Street, City, Country'
      });
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      // Keep default values if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const refreshSystemSettings = () => {
    fetchSystemSettings();
  };

  const value = {
    systemSettings,
    loading,
    refreshSystemSettings
  };

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
};