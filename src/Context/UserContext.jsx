import React, { createContext, useContext, useState, useEffect } from 'react';
import TokenManager from './TokenManager'; // Import the TokenManager

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(TokenManager.getToken()); // Initialize from TokenManager

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      TokenManager.setToken(token); // Save token via TokenManager
    } else {
      TokenManager.setToken(null);
    }
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    TokenManager.setToken(null);
  };

  return (
    <UserContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
