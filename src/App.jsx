// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './Context/UserContext';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import GameDetails from './Pages/GameDetails';
import AddGameToDatabase from './Pages/AddGameToDatabase';
import MyCollection from './Pages/MyCollection';
import MyWishlist from './Pages/MyWishlist';
import Search from './Pages/Search';
import AccountSettings from './Pages/AccountSettings';
import EditGameDetails from './Pages/EditGameDetails';
import ReportsMenu from './Pages/ReportsMenu';
import PrivateRoute from './Context/PrivateRoute';
import AdminRoute from './Context/AdminRoute.jsx'; // Import AdminRoute

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/GameDetails" element={<GameDetails />} />
            <Route path="/AddGameToDatabase" element={<AddGameToDatabase />} />
            <Route path="/MyCollection" element={<MyCollection />} />
            <Route path="/MyWishlist" element={<MyWishlist />} />
            <Route path="/Search" element={<Search />} />
            <Route path="/AccountSettings" element={<AccountSettings />} />
            <Route path="/EditGameDetails" element={<EditGameDetails />} />
          </Route>

          {/* Admin-only route */}
          <Route element={<AdminRoute />}>
            <Route path="/ReportsMenu" element={<ReportsMenu />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
