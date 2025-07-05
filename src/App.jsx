// App.jsx
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
import PublicRoute from './Context/PublicRoute';
import PrivateRoute from './Context/PrivateRoute';
import AdminRoute from './Context/AdminRoute.jsx';
import { SortFilterProvider } from './Context/SortFilterContext.jsx';
import { Outlet } from 'react-router-dom';
import WishlistDetails from './Pages/WishlistDetails.jsx';
import EditWishlistDetails from './Pages/EditWishlistDetails.jsx';
import UserSearch from './Pages/UserSearch';
import UserProfile from './Pages/UserProfile';
import MessageThread from './Pages/MessageThread';

const SortFilterLayout = () => (
  <SortFilterProvider>
    <Outlet />
  </SortFilterProvider>
);

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
          </Route>


          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/GameDetails" element={<GameDetails />} />
            <Route path="/AddGameToDatabase" element={<AddGameToDatabase />} />

            <Route element={<SortFilterLayout />}>
              <Route path="/MyCollection" element={<MyCollection />} />
              <Route path="/MyWishlist" element={<MyWishlist />} />
              <Route path="/Search" element={<Search />} />
              {/* Viewing someone else's collection/wishlist */}
              <Route path="/users/:userId/collection" element={<MyCollection />} />
              <Route path="/users/:userId/wishlist" element={<MyWishlist />} />
            </Route>

            <Route path="/AccountSettings" element={<AccountSettings />} />
            <Route path="/EditGameDetails" element={<EditGameDetails />} />
            <Route path="/WishlistDetails" element={<WishlistDetails />} />
            <Route path="/EditWishlistDetails" element={<EditWishlistDetails />} />

            {/* Friend & messaging routes: */}
            <Route path="/users" element={<UserSearch />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/messages/inbox" element={<MessageThread />} />
            <Route path="/messages/friends" element={<MessageThread />} />
            <Route path="/messages/:thread" element={<MessageThread />} />



            {/* Admin-only route nested within PrivateRoute */}
            <Route element={<AdminRoute />}>
              <Route path="/ReportsMenu" element={<ReportsMenu />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
