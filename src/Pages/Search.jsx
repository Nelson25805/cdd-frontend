// src/Pages/Search.jsx
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import '../App.css';
import { searchGames, checkGameDetails, checkWishlist } from '../Api';

// 1️⃣ Import the context hook and controls component
import { useSortFilter } from '../Context/useSortFilter';
import SortFilterControls from '../Context/SortFilterControls';
import CoverImage from '../Context/CoverImage';

const Search = () => {
  const { user, token } = useUser();
  const { userid: userId } = user || {};
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = new URLSearchParams(location.search).get('q');

  const [searchResults, setSearchResults] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 2️⃣ Grab sort/filter values from context
  const { sortDirection, filterConsole } = useSortFilter();

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Fetch results & reset page when searchQuery/token changes
  useEffect(() => {
    let active = true;

    const fetchResults = async () => {
      setItemsLoaded(false);
      try {
        const results = await searchGames(searchQuery, token);
        if (!active) return;

        setSearchResults(Array.isArray(results) ? results : []);
        setCurrentPage(1); // ✅ Reset to page 1 after data arrives
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setItemsLoaded(true);
      }
    };

    if (searchQuery) {
      fetchResults();
    } else {
      setSearchResults([]);
      setItemsLoaded(true);
      setCurrentPage(1);
    }

    return () => { active = false; };
  }, [searchQuery, token]);

  // Loading-dots animation
  useEffect(() => {
    const id = setInterval(() => {
      setLoadingDots(d => (d.length < 3 ? d + '.' : '.'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  const handleGameDetails = async (game) => {
    if (!token) return navigate('/login');
    try {
      const data = await checkGameDetails(userId, game.GameId);
      if (data.hasDetails) {
        alert('You already have details for this game in your collection.');
      } else {
        navigate(`/GameDetails?q=${encodeURIComponent(game.GameId)}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error checking GameDetails.');
    }
  };

  const handleAddToWishlist = async (game) => {
    if (!token) return navigate('/login');
    try {
      const { hasWishlist } = await checkWishlist(userId, game.GameId);
      if (hasWishlist) {
        alert('This game is already in your wishlist.');
      } else {
        navigate(`/WishlistDetails?q=${encodeURIComponent(game.GameId)}`);
      }
    } catch (err) {
      console.error(err);
      alert('Unable to check wishlist status right now.');
    }
  };

  // Build filtered & sorted list before pagination
  const filteredResults = Array.isArray(searchResults)
    ? searchResults.filter(g =>
        filterConsole === 'All' ||
        (Array.isArray(g.Consoles) && g.Consoles.some(c => c.name === filterConsole))
      )
    : [];

  const sortedResults = [...filteredResults].sort((a, b) => {
    const dir = sortDirection === 'Ascending' ? 1 : -1;
    return a.Name.localeCompare(b.Name) * dir;
  });

  const start = (currentPage - 1) * itemsPerPage;
  const pageResults = sortedResults.slice(start, start + itemsPerPage);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));

  // Clamp current page if filter/sort reduces totalPages
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
          <SortFilterControls />
          <div className="game-section">
            <h1>Results for: {searchQuery}</h1>
            {!itemsLoaded && <p>Loading results please wait{loadingDots}</p>}
            <div className="game-item-header">
              <div className="game-item-header-photo"><p>Photo</p></div>
              <div className="game-item-header-name-console">
                <p className="game-item-header-name">Name</p><p>Console</p>
              </div>
              <div className="game-item-header-actions"><p>Actions</p></div>
            </div>
            {pageResults.map(game => (
              <div key={game.GameId} className="game-item">
                <div className="game-item-photo">
                  <CoverImage cover={game.CoverArt} alt={game.Name} />
                </div>
                <div className="game-item-name-console">
                  <div className="name-cell"><div className="name-list">
                    <p className="game-item-name">{game.Name}</p>
                  </div></div>
                  <div className="console-cell"><div className="console-list">
                    {Array.isArray(game.Consoles) &&
                      game.Consoles.map(c => c.name)
                        .sort((a, b) => a.localeCompare(b))
                        .map(name => (
                          <div key={name} className="console-item">{name}</div>
                        ))}
                  </div></div>
                </div>
                <div className="game-item-actions">
                  <button className="link-button" onClick={() => handleGameDetails(game)}>
                    + Add To Collection
                  </button>
                  <button className="link-button" onClick={() => handleAddToWishlist(game)}>
                    + Add To Wishlist
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
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
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
