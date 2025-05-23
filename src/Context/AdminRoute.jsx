// AdminRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './UserContext';

const AdminRoute = () => {
  const { user } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('This is user.admin stuff: ', user.admin);
      if (user.admin) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setShowError(true);
        setTimeout(() => setShowError(false), 2000); // Display error for 2 seconds
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Optionally, show a loading spinner or message
  }

  if (showError) {
    return (
      <div>
        <p>You do not have permission to access this page. Redirecting to home...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
