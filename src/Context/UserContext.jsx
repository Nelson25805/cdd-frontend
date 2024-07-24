import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context to hold the user data and related functions
const UserContext = createContext();

// UserProvider component that wraps your app and provides user-related data
export function UserProvider({ children }) {
  // State to store user data
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user and token from local storage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Save user and token to local storage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Function to log out the user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
}


// Custom hook to access the user context
export function useUser() {
  return useContext(UserContext);
}
