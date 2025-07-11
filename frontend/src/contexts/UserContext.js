import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../api/userAPI";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = not initialized, null = logged out, object = logged in

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const decoded = jwtDecode(token);
      
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }

      const profile = await getUserProfile(token);
      return { token, decoded, profile };
    } catch (error) {
      console.error("Authentication error:", error.message);
      localStorage.removeItem("token");
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const userData = await fetchUserProfile(token);
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  const updateProfile = useCallback((updatedFields) => {
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          ...updatedFields,
        },
      };
    });
  }, []);

  const refreshUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }
    
    try {
      const updated = await fetchUserProfile(token);
      setUser(updated);
      return updated;
    } catch (error) {
      setUser(null);
      return null;
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <UserContext.Provider
      value={{ 
        user, 
        setUser, 
        logout, 
        updateProfile, 
        refreshUserProfile 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};