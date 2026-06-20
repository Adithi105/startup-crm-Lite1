/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

export const UserContext = createContext();

const DEFAULT_USER = {
  name: "C Adithi",
  role: "CSE-AI Student",
  organization: "MITS",
  avatarInitials: "AY",
  email: "adithi.c@mits.ac.in",
  phone: "+91 98765 43210",
  bio: "Computer Science & Engineering student specializing in Artificial Intelligence. Passionate about software development, machine learning, and SaaS ecosystems.",
  profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256"
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("crm_user");
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem("crm_auth");
    if (saved === null) {
      localStorage.setItem("crm_auth", "true");
      return true;
    }
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("crm_user", JSON.stringify(user));
  }, [user]);

  const login = (email, password) => {
    // Real CRM credential check: simple validation or demo access
    if (email && password) {
      setIsAuthenticated(true);
      localStorage.setItem("crm_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("crm_auth", "false");
  };

  const updateProfile = (newDetails) => {
    setUser((prev) => {
      // Calculate new initials from name if changed
      let avatarInitials = prev.avatarInitials;
      if (newDetails.name && newDetails.name !== prev.name) {
        const parts = newDetails.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          avatarInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length > 0) {
          avatarInitials = parts[0][0].toUpperCase();
        }
      }
      return {
        ...prev,
        ...newDetails,
        avatarInitials
      };
    });
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
