import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';

export const AuthContext = createContext();

function mapApiUser(apiUser) {
  if (!apiUser) return null;
  const parts = (apiUser.name || "").trim().split(/\s+/);
  let avatarInitials = "?";
  if (parts.length >= 2) {
    avatarInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    avatarInitials = parts[0][0].toUpperCase();
  }

  return {
    name: apiUser.name || "",
    email: apiUser.email || "",
    role: apiUser.role || "user",
    avatarInitials,
    organization: apiUser.organization || "",
    phone: apiUser.phone || "",
    bio: apiUser.bio || "",
    profilePhoto: apiUser.profilePhoto || "",
    _id: apiUser._id || apiUser.id || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('crm-token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount if token is present
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('crm-token');
      if (storedToken) {
        try {
          const data = await authService.getProfile();
          // Backend returns user data in data.data or data.user or data directly
          const userData = data.data || data.user || data;
          const mapped = mapApiUser(userData);
          setUser(mapped);
          localStorage.setItem('crm_user', JSON.stringify(mapped));
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Token is invalid/expired
          localStorage.removeItem('crm-token');
          localStorage.removeItem('crm_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      // Expected backend response: { success: true, token: "...", user: {...} }
      const resToken = data.token;
      const rawUser = data.user || data.data;
      const mapped = mapApiUser(rawUser);

      localStorage.setItem('crm-token', resToken);
      localStorage.setItem('crm_user', JSON.stringify(mapped));

      setToken(resToken);
      setUser(mapped);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.register(name, email, password);
      // Expected backend response: { success: true, token: "...", user: {...} }
      const resToken = data.token;
      const rawUser = data.user || data.data;
      const mapped = mapApiUser(rawUser);

      localStorage.setItem('crm-token', resToken);
      localStorage.setItem('crm_user', JSON.stringify(mapped));

      setToken(resToken);
      setUser(mapped);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (newDetails) => {
    try {
      const data = await authService.updateProfile(newDetails);
      const rawUser = data.user || data.data || data;
      const mapped = mapApiUser(rawUser);
      setUser(mapped);
      localStorage.setItem('crm_user', JSON.stringify(mapped));
      return { success: true };
    } catch (error) {
      // Local fallback in case update fails but we want to allow offline presentation
      setUser((prev) => {
        if (!prev) return null;
        let avatarInitials = prev.avatarInitials || "?";
        if (newDetails.name && newDetails.name !== prev.name) {
          const parts = newDetails.name.trim().split(/\s+/);
          if (parts.length >= 2) {
            avatarInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          } else if (parts.length === 1 && parts[0].length > 0) {
            avatarInitials = parts[0][0].toUpperCase();
          }
        }
        const merged = { ...prev, ...newDetails, avatarInitials };
        localStorage.setItem('crm_user', JSON.stringify(merged));
        return merged;
      });
      const errorMsg = error.response?.data?.message || error.message;
      return { success: false, error: errorMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
