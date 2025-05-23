import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/UserContext';
import { getWishlist, removeFromWishlist } from '../Api';
import '../App.css';

function MyWishlist() {
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [filterConsole, setFilterConsole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [wishlistItems, setWishlistItems] = useState([]);
  const [, setLoading] = useState(false);
  const { user, loading: userLoading } = useUser(); // Destructure loading from useUser
  const userId = user?.userid; // Ensure userId is safely accessed

  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  const fetchWishlistItems = useCallback(async () => {
    console.log('UserId: ', userId);
    console.log('User: ', user);
    try {
      if (!userId) {
        console.log('User ID not available');
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('token');  // Assuming token is stored in localStorage
      console.log('Fetching wishlist items...');
      const response = await getWishlist(userId, token);
      console.log('Wishlist items fetched:', response);
      if (response && response.results) {
        setWishlistItems(response.results); // Access the results property correctly
        setItemsLoaded(true);
      } else {
        console.log('Invalid response format', response);
      }
    } catch (error) {
      console.error('Error fetching wishlist items:', error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const applySortAndFilter = () => {
    const filteredResults = wishlistItems.filter((game) =>
      filterConsole === 'All' ? true : game.Console === filterConsole
    );

    const sortedResults = [...filteredResults];

    sortedResults.sort((a, b) => {
      const comparison = sortDirection === 'Ascending' ? 1 : -1;
      return a.Name.localeCompare(b.Name) * comparison;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return sortedResults.slice(startIndex, endIndex);
  };

  useEffect(() => {
    if (!userLoading) { // Wait until user data is loaded
      fetchWishlistItems();
    }
  }, [userId, userLoading, sortDirection, filterConsole, currentPage, fetchWishlistItems]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : '.'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRemoveGameFromWishlist = async (gameId) => {
    try {
      const token = localStorage.getItem('token');  // Assuming token is stored in localStorage
      await removeFromWishlist(userId, gameId, token);
      setWishlistItems(prevWishlistItems =>
        prevWishlistItems.filter(game => game.GameId !== gameId)
      );
      alert('Game removed successfully from wishlist.');
    } catch (error) {
      console.error('Error removing game:', error.message);
    }
  };

  if (userLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="App">
      <TopLinks />
      <h2>My Wishlist</h2>
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
              <select value={filterConsole} onChange={(e) => setFilterConsole(e.target.value)}>
                <option value="All">All</option>
                <option value="Xbox">Xbox</option>
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
            {(!itemsLoaded && loadingDots) && (
              <p>Loading results please wait ..{loadingDots}</p>
            )}
            <div className="game-item-header">
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
            {applySortAndFilter().map((game) => (
              <div key={game.GameId} className="game-item">
                <img src={`data:image/png;base64,${game.CoverArt}`} alt={game.Name} />
                <div className='game-item-name-console'>
                  <p className='game-item-name'>{game.Name}</p>
                  <p>{game.Console}</p>
                </div>
                <div className='game-item-actions'>
                  <p>
                    <Link to="#" onClick={() => handleRemoveGameFromWishlist(game.GameId)}>
                      Remove
                    </Link>
                  </p>
                </div>
              </div>
            ))}
            <div>
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span> Page {currentPage} of {Math.ceil(wishlistItems.length / itemsPerPage)} </span>
              <button onClick={handleNextPage} disabled={currentPage === Math.ceil(wishlistItems.length / itemsPerPage)}>
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MyWishlist;
