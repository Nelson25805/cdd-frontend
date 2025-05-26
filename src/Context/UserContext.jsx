import { createContext, useState, useEffect } from 'react';
import TokenManager from './TokenManager';
import apiClient from '../Api';
import PropTypes from 'prop-types';

export const UserContext = createContext();

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
    } catch {
      // user is already logged out
    }
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

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

