// TopLinks.jsx
import { useState } from 'react';
import arrow from '../Images/arrow.png';
import logo from '../Images/logo.png';
import { useUser } from '../Context/useUser';
import { Link, useNavigate } from 'react-router-dom';

const TopLinks = () => {
  const { user, logout } = useUser();           // <-- grab logout
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(o => !o);
  };

  return (
    <header className="App-header">
      <div className="homepage-button">
        <Link to="/"><img src={logo} alt="Logo" /></Link>
      </div>

      <div className="top-right-links">
        {user ? (
          <>
            <div className="dropdown" onClick={toggleDropdown}>
              <span className="username">
                My Account <img src={arrow} alt="arrow" />
              </span>
              {isDropdownOpen && (
                <div className="dropdown-content">
                  <Link to={`/users/${user.username}/collection`} className="dropdown-link">My Collection</Link>
                  <Link to={`/users/${user.username}/wishlist`} className="dropdown-link">My Wishlist</Link>
                  <Link to="/accountsettings" className="dropdown-link">Account Settings</Link>
                  <Link to={`/users/${user.username}`} className="dropdown-link">My Profile</Link>
                  
                  <Link to="/users" className="dropdown-link">Find Users</Link>
                  {user.admin && (
                    <Link to="/reportsmenu" className="dropdown-link">Reports Menu</Link>
                  )}
                </div>
              )}
            </div>
            <span className="spacer"> | </span>
            <Link
              to="/"
              className="link"
              onClick={async e => {
                e.preventDefault();
                await logout();
                // now actually navigate
                navigate('/');
              }}
            >
              Logout
            </Link>

          </>
        ) : (
          <>
            <Link to="/Register" className="link">Register</Link>
            <span className="spacer"> | </span>
            <Link to="/Login" className="link">Log In</Link>
          </>
        )}
      </div>

      {user && (
        <div className="search-content">
          <input
            type="text"
            placeholder="Search for a game....."
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="small-button" onClick={handleSearch}>Go</button>
        </div>
      )}
    </header>
  );
};

export default TopLinks;
