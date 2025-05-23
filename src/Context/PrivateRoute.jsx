// PrivateRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import TokenManager from '../Context/TokenManager';

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
        console.log('Checking if token is there in Private Route!');
      try {
        const token = TokenManager.getToken();
        console.log('This is the token in private route: ', token);
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setIsAuthenticated(false);
      }
    };

    checkToken();
  }, []);

  if (isAuthenticated === null) {
    console.log('Loading state for PrivateRoute');
    return <div>Loading...</div>; // Optionally, show a loading spinner or message
  }

  console.log('Rendering PrivateRoute, isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/Login" />;
};

export default PrivateRoute;
