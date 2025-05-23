import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/UserContext';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { searchGames, addToWishlist, checkGameDetails } from '../Api';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = new URLSearchParams(location.search).get('q');
  const [searchResults, setSearchResults] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [filterConsole, setFilterConsole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { user, token } = useUser();
  const { userid: userId } = user || {};


  // Redirect if the user is not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  const applySortAndFilter = () => {
    // Ensure searchResults is an array
    if (!Array.isArray(searchResults)) {
      console.error('Expected searchResults to be an array, but received:', searchResults);
      return []; // Return an empty array if not an array
    }

    const filteredResults = searchResults.filter((game) =>
      filterConsole === 'All' ? true : game.Console === filterConsole
    );

    const sortedResults = [...filteredResults];

    sortedResults.sort((a, b) => {
      const comparison = sortDirection === 'Ascending' ? 1 : -1;
      return a.Name.localeCompare(b.Name) * comparison;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedResults = sortedResults.slice(startIndex, endIndex);

    return paginatedResults;
  };

  useEffect(() => {
    if (searchQuery) {
      if (user && user.userId) {
        console.log('User:', user);
      }
      fetchSearchResults(searchQuery);
    } else {
      setItemsLoaded(true);
    }
  }, [user, searchQuery, sortDirection, filterConsole, currentPage]);

  const fetchSearchResults = async (query) => {
    try {
      const data = await searchGames(query, user.token);
      console.log('Data fetched:', data); // Log the fetched data

      // Check if data.results is an array
      if (Array.isArray(data.results)) {
        setSearchResults(data.results);
      } else {
        console.error('Expected data.results to be an array, but received:', data.results);
        setSearchResults([]);
      }

      setItemsLoaded(true);
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      setSearchResults([]);
      setItemsLoaded(true); // Ensure itemsLoaded is true even in case of error
    }
  };



  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : '.'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);


    const handleAddToWishlist = async (game) => {
  if (!token) {
    // not logged in, bounce to login
    return navigate('/login');
  }

  try {
    console.log('UserId:', userId, 'GameId:', game.GameId);
    const response = await addToWishlist(userId, game.GameId);
    console.log('Added to wishlist:', response);
    alert('Game added to wishlist successfully!');
  } catch (error) {
    // If the server sends a 409 Conflict for “already in wishlist”
    if (error.response?.status === 409) {
      return alert('This game is already in your wishlist.');
    }

    // Otherwise fallback to the generic error
    console.error('Error adding to wishlist:', error);
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Unknown error';
    alert('Error adding game to wishlist: ' + msg);
  }
};




  const handleGameDetails = async (game) => {
    if (!token) {
      return navigate('/login');
    }

    try {
      console.log('Checking details for user', userId, 'game', game.GameId);
      const data = await checkGameDetails(userId, game.GameId);
      if (data.hasDetails) {
        alert('You already have details for this game in your collection.');
      } else {
        navigate(`/gamedetails?q=${encodeURIComponent(game.GameId)}`);
      }
    } catch (error) {
      console.error('Error checking GameDetails:', error);
      alert('Error checking GameDetails.');
    }
  };


  // Render UI component
  return (
    <div className="App">
      <TopLinks />
      <div className="search-content">
        <main className="search-main-content">
          <div className="sort-filter-section">
            <p>Sort & Filter</p>
            <div>
              <p>Sort By:</p>
              <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
            </div>
            <div>
              <p>Filter By Console:</p>
              {/* Dropdown for Filter By Console options */}
              <select value={filterConsole} onChange={(e) => setFilterConsole(e.target.value)}>
                <option value="All"> All</option>
                <option value="Xbox"> Xbox</option>
                <option value="Xbox 360">Xbox 360</option>
                <option value="Xbox One">Xbox One</option>
                <option value="NES">NES</option>
                <option value="SNES">SNES</option>
                <option value="Nintendo 64">Nintendo 64</option>
                <option value="Gamecube">Gamecube</option>
                <option value="Wii">Wii</option>
                <option value="Wii U">Wii U</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
                <option value="Playstation 1">Playstation 1</option>
                <option value="Playstation 2">Playstation 2</option>
                <option value="Playstation 3">Playstation 3</option>
                <option value="Playstation 4">Playstation 4</option>
              </select>
            </div>
          </div>

          <div className="game-section">
            <h1>Results for: {searchQuery}</h1>
            {(!itemsLoaded && loadingDots) && (
              <p>Loading results please wait ..{loadingDots}</p>
            )}
            <div
              className="game-item-header">
              <div className='game-item-header-photo'>
                <p>Photo</p>
              </div>
              <div className='game-item-header-name-console'>
                <p className='game-item-header-name'>Name</p>
                <p>Console</p>
              </div>
              <div className='game-item-header-actions'>
                <p>Actions</p>
              </div>
            </div>
            {/* Mapping over paginated results and rendering game items */}
            {applySortAndFilter().map((game, index) => (

              <div key={game.GameId} className="game-item">
                <img src={`data:image/jpg;base64,${game.CoverArt}`} alt={game.Name} />
                <div className='game-item-name-console'>
                  <p className='game-item-name'>{game.Name}</p>
                  <p>{game.Console}</p>
                </div>
                <div className='game-item-actions'>
                  {/* Button to handle adding to collection with details */}
                  <p>
                    <button className="link-button"
                      onClick={() => handleGameDetails(game, user.userid)}
                    >
                      + Collection (With Details)
                    </button>
                  </p>
                  {/* Link to handle adding to wishlist */}
                  <p>
                    <Link to="#" onClick={() => handleAddToWishlist(game, user.userid)}>
                      + Wishlist
                    </Link>
                  </p>
                </div>
              </div>
            ))}
            {/* Pagination controls */}
            <div>
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span> Page {currentPage} of {Math.ceil(searchResults.length / itemsPerPage)} </span>
              <button onClick={handleNextPage} disabled={currentPage === Math.ceil(searchResults.length / itemsPerPage)}>
                Next
              </button>
            </div>
            {/* Message for adding a game manually to the database */}
            {itemsLoaded && (
              <p className='bottom-add-game-link'>
                Not the results you`re looking for?{' '}
                <span className='bottom-add-game-link2'>
                  <Link to="/AddGameToDatabase">Click here to add a game manually to our database!</Link>
                </span>
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Search;
