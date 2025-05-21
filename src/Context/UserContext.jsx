import React, { createContext, useContext, useState, useEffect } from 'react';
import TokenManager from './TokenManager';
import apiClient from '../Api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    // Skip refresh only on login/register pages
    if (path === '/login' || path === '/register') {
      setInitializing(false);
      return;
    }

    (async () => {
      try {
        const newToken = await TokenManager.refreshAccessToken();
        setToken(newToken);
        const profileRes = await apiClient.get('/api/me');
        setUser(profileRes.data.user);
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // update in-memory token whenever it changes
  useEffect(() => {
    if (token) {
      TokenManager.setAccessToken(token);
    }
  }, [token]);

  const logout = async () => {
    try {
      await apiClient.post('/api/logout');
    } catch {}
    setUser(null);
    setToken(null);
    TokenManager.setAccessToken(null);
    window.location.href = '/';
  };

  if (initializing) {
    return <div className="App">Loading…</div>;
  }

  return (
    <UserContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
