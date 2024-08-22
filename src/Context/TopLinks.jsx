// Importing necessary React components and modules
import React, { useState } from 'react';
import arrow from '../Images/arrow.png';
import logo from '../Images/logo.png';
import { useUser } from '../Context/UserContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// TopLinks component definition
/*This function is used to handle the searchbar, and links at the
top of the page that lead to the users collection, wishlist, account
settings, and if an admin account, a reports page. */
const TopLinks = () => {
  // Destructuring necessary functions and state from UserContext
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  // State for the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle search
  const handleSearch = () => {
    // Navigate to the Search page with the search query as a parameter
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // State to toggle the dropdown menu
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  // Function to toggle the dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // Function to handle logout
  const handleLogout = () => {
    // Clear user data
    setUser(null);

    // Clear the token from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // Redirect to the home page
    navigate('/');
  };

  // Render UI component
  return (
    <header className="App-header">
      <div className='homepage-button'>
        {/* Link to the home page */}
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
      </div>

      <div className="top-right-links">
        {/* Conditional rendering based on user authentication */}
        {user ? (
          <>
            {/* Dropdown for authenticated users */}
            <div className="dropdown" onClick={toggleDropdown}>
              <span className="username">
                My Account
                <img src={arrow} alt="arrow" />
              </span>
              {isDropdownOpen && (
                <div className="dropdown-content">
                  <Link to="/mycollection" className="dropdown-link">
                    My Collection
                  </Link>
                  <Link to="/mywishlist" className="dropdown-link">
                    My Wishlist
                  </Link>
                  <Link to="/accountsettings" className="dropdown-link">
                    Account Settings
                  </Link>
                  {user.admin && (
                    <div className="dropdown-content">
                      <Link to="/reportsmenu" className="dropdown-link">
                        Reports Menu
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="spacer"> | </span>
            {/* Logout link */}
            <Link to="/" className="link" onClick={handleLogout}>
              Logout
            </Link>
          </>
        ) : (
          <>
            {/* Links for non-authenticated users */}
            <Link to="/Register" className="link">
              Register
            </Link>
            <span className="spacer"> | </span>
            <Link to="/Login" className="link">
              Log In
            </Link>
          </>
        )}
      </div>
      {/* Search bar for authenticated users */}
      {user && (
        <div className="search-content">
          <input
            type="text"
            placeholder="Search for a game....."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="small-button" onClick={handleSearch}>
            Go
          </button>
        </div>
      )}
    </header>
  );
};

export default TopLinks;
