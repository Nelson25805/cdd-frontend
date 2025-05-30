// src/Pages/Search.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { searchGames, addToWishlist, checkGameDetails } from '../Api';

// 1️⃣ Import the context hook and controls component
import { useSortFilter } from '../Context/useSortFilter';
import SortFilterControls from '../Context/SortFilterControls';


const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = new URLSearchParams(location.search).get('q');

  const [searchResults, setSearchResults] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { user, token } = useUser();
  const { userid: userId } = user || {};

  // 2️⃣ Grab sort/filter values from context
  const {
    sortDirection,
    filterConsole,
    // (you could also update these here if you need)
  } = useSortFilter();

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const handleNextPage = () => setCurrentPage((p) => p + 1);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  // 3️⃣ Use context values in your filtering/sorting/pagination
  const applySortAndFilter = () => {
    if (!Array.isArray(searchResults)) return [];

    // filter
    const filtered = searchResults.filter((g) =>
      filterConsole === 'All' ? true : g.Console === filterConsole
    );
    // sort
    filtered.sort((a, b) => {
      const dir = sortDirection === 'Ascending' ? 1 : -1;
      return a.Name.localeCompare(b.Name) * dir;
    });
    // paginate
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  };

  // Fetch on query/token change
  useEffect(() => {
    let active = true;
    const fetchResults = async () => {
      try {
        const { results } = await searchGames(searchQuery, token);
        if (!active) return;
        setSearchResults(Array.isArray(results) ? results : []);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setItemsLoaded(true);
      }
    };

    if (searchQuery) {
      setItemsLoaded(false);
      fetchResults();
    } else {
      setSearchResults([]);
      setItemsLoaded(true);
    }
    return () => { active = false; };
  }, [searchQuery, token]);

  // Loading-dots animation
  useEffect(() => {
    const id = setInterval(() => {
      setLoadingDots((d) => (d.length < 3 ? d + '.' : '.'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Wishlist / Details handlers unchanged…
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
        // ✅ Proper template string with backticks:
        navigate(`/GameDetails?q=${encodeURIComponent(game.GameId)}`);

      }
    } catch (error) {
      console.error('Error checking GameDetails:', error);
      alert('Error checking GameDetails.');
    }
  };

  // Calculate total pages for UI
  const totalPages = Math.ceil(
    (Array.isArray(searchResults)
      ? searchResults.filter((g) =>
        filterConsole === 'All' ? true : g.Console === filterConsole
      ).length
      : 0) / itemsPerPage
  );

  return (
    <div className="App">
      <TopLinks />
      <div className="search-content">
        <main className="search-main-content">

          {/* 4️⃣ Render the shared sort/filter controls */}
          <SortFilterControls />

          <div className="game-section">
            <h1>Results for: {searchQuery}</h1>
            {!itemsLoaded && <p>Loading results please wait{loadingDots}</p>}

            <div className="game-item-header">
              <div className="game-item-header-photo"><p>Photo</p></div>
              <div className="game-item-header-name-console">
                <p className="game-item-header-name">Name</p>
                <p>Console</p>
              </div>
              <div className="game-item-header-actions"><p>Actions</p></div>
            </div>

            {applySortAndFilter().map((game) => (
              <div key={game.GameId} className="game-item">
                <img src={`data:image/jpg;base64,${game.CoverArt}`} alt={game.Name} />

                <div className="game-item-name-console">
                  {/* 1️⃣ Name cell */}
                  <div className="name-cell">
                    <p className="game-item-name">{game.Name}</p>
                  </div>

                  {/* 2️⃣ Console cell (scrollable) */}
                  <div className="console-cell">
                    <div className="console-list">
                      {(Array.isArray(game.Consoles) ? game.Consoles : [game.Console])
                        .map(c => <div key={c} className="console-item">{c}</div>)}
                    </div>
                  </div>
                </div>


                <div className="game-item-actions">
                  <button
                    className="link-button"
                    onClick={() => handleGameDetails(game)}
                  >
                    + Collection (With Details)
                  </button>
                  <Link to="#" onClick={() => handleAddToWishlist(game)}>
                    + Wishlist
                  </Link>
                </div>
              </div>
            ))}

            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span> Page {currentPage} of {totalPages} </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>

            {itemsLoaded && (
              <p className="bottom-add-game-link">
                Not the results you’re looking for?{' '}
                <Link to="/AddGameToDatabase">
                  Click here to add a game manually to our database!
                </Link>
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Search;
