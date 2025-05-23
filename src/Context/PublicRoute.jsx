import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './UserContext';

const PublicRoute = () => {
  const { user } = useUser();

  // If user is logged in, redirect to the home page or another protected page
  if (user) {
    return <Navigate to="/" />;
  }

  // If not logged in, render the child components (e.g., Login or Register pages)
  return <Outlet />;
};

export default PublicRoute;
