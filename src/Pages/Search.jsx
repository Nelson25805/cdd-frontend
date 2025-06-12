// src/Pages/Search.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { searchGames, checkGameDetails, checkWishlist } from '../Api';

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
  
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  // Fetch on query/token change
  useEffect(() => {
    let active = true;
    const fetchResults = async () => {
      try {
        const results = await searchGames(searchQuery, token);
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
    if (!token) return navigate('/login');
    navigate(`/WishlistDetails?q=${encodeURIComponent(game.GameId)}`);
    // first ask the server whether it's already in the wishlist
    try {
      const { hasWishlist } = await checkWishlist(userId, game.GameId);
      if (hasWishlist) {
        return alert('This game is already in your wishlist.');
      }

      // otherwise proceed to your WishlistDetails page
      navigate(`/WishlistDetails?q=${encodeURIComponent(game.GameId)}`);
    } catch (err) {
      console.error('Error checking wishlist:', err);
      alert('Unable to check wishlist status right now.');
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

  // 1️⃣ Build the filtered list once, so we can both paginate and count correctly
  const filteredResults = Array.isArray(searchResults)
    ? searchResults.filter((g) => {
      if (filterConsole === 'All') return true;
      return Array.isArray(g.Consoles)
        ? g.Consoles.some((c) => c.name === filterConsole)
        : false;
    })
    : [];

  // 2️⃣ Sort that filtered list
  const sortedResults = [...filteredResults].sort((a, b) => {
    const dir = sortDirection === 'Ascending' ? 1 : -1;
    return a.Name.localeCompare(b.Name) * dir;
  });

  // 3️⃣ Then paginate
  const start = (currentPage - 1) * itemsPerPage;
  const pageResults = sortedResults.slice(start, start + itemsPerPage);

  // 4️⃣ Now compute totalPages based on the filtered length
  const rawTotal = Math.ceil(filteredResults.length / itemsPerPage);
  const totalPages = rawTotal > 0 ? rawTotal : 1; // ensure at least 1 page

  // 5️⃣ Clamp currentPage in case the filter changed it to > totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


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

            {pageResults.map((game) => (
              <div key={game.GameId} className="game-item">
                <img src={`data:image/jpg;base64,${game.CoverArt}`} alt={game.Name} />

                <div className="game-item-name-console">
                  {/* 1️⃣ Name cell (scrollable) */}
                  <div className="name-cell">
                    <div className="name-list">
                      <p className="game-item-name">{game.Name}</p>
                    </div>
                  </div>

                  {/* 2️⃣ Console cell (scrollable) */}
                  <div className="console-cell">
                    <div className="console-list">
                      {Array.isArray(game.Consoles) && game.Consoles
                        .map((c) => c.name)           // pull out just the names
                        .sort((a, b) => a.localeCompare(b))
                        .map((name) => (
                          <div key={name} className="console-item">
                            {name}
                          </div>
                        ))
                      }
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
                  <button
                    className="link-button"
                    onClick={() => handleAddToWishlist(game)}
                  >
                    + Wishlist (Select Platforms)
                  </button>
                </div>
              </div>
            ))}

            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span> Page {currentPage} of {totalPages} </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>

            {itemsLoaded && (
              <p>
                Not the results you’re looking for?{' '}
                <Link to="/AddGameToDatabase" className="link-button">
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
