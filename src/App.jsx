import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/GameDetails" element={<GameDetails />} />
          <Route path="/AddGameToDatabase" element={<AddGameToDatabase />} />
          <Route path="/MyCollection" element={<MyCollection />} />
          <Route path="/MyWishlist" element={<MyWishlist />} />
          <Route path="/Search" element={<Search />} />
          <Route path="/AccountSettings" element={<AccountSettings />} />
          <Route path="/EditGameDetails" element={<EditGameDetails />} />
          <Route path="/ReportsMenu" element={<ReportsMenu />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
