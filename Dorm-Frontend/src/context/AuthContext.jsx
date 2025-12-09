import { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentUser,
  getCurrentUserFromStorage,
  isAuthenticated 
} from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const storedUser = getCurrentUserFromStorage();
          if (storedUser) {
            setUser(storedUser);
            setIsAuth(true);
          } else {
            // Try to fetch user from API
            const userData = await getCurrentUser();
            setUser(userData);
            setIsAuth(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      setUser(response.user);
      setIsAuth(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuth(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: isAuth,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

