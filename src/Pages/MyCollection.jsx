import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';

// Import API functions
import { fetchCollectionItems, removeGameFromCollection } from '../Api';

import '../App.css';

function MyCollection() {
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [filterConsole, setFilterConsole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [collectionItems, setCollectionItems] = useState([]);

  const [, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.userid; // Ensure userId is safely accessed

  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  const fetchItems = useCallback(async () => {
    try {
      console.log('Current userId: ', userId);
      if (!userId) {
        return;
      }
      console.log('Trying to see collection items');
      setLoading(true);
      const items = await fetchCollectionItems(userId);
      setCollectionItems(items);
      setItemsLoaded(true);
    } catch (error) {
      console.error('Error fetching collection items:', error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const applySortAndFilter = () => {
    const filteredResults = collectionItems.filter((game) =>
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
    fetchItems();
  }, [userId, sortDirection, filterConsole, currentPage, fetchItems]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : '.'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleRemoveGame = async (gameId) => {
    try {
      const success = await removeGameFromCollection(userId, gameId);
      if (success) {
        alert('Game was removed successfully from collection.');
        fetchItems();
      }
    } catch (error) {
      console.error('Error removing game:', error.message);
    }
  };

  const handleEditGameDetails = (game) => {
    navigate(`/editgamedetails?q=${encodeURIComponent(game.GameId)}`);
  };

  return (
    <div className="App">
      <TopLinks />
      <h2>My Collection</h2>
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
                <option value="">Select Platform...</option>
                <option value="Xbox">Xbox</option>
                <option value="Xbox 360">Xbox 360</option>
                <option value="Xbox One">Xbox One</option>
                <option value="Nes">NES</option>
                <option value="Gameboy">Gameboy</option>
                <option value="Gameboy Color">Gameboy Color</option>
                <option value="Snes">SNES</option>
                <option value="Nintendo 64">Nintendo 64</option>
                <option value="Gamecube">Gamecube</option>
                <option value="Gameboy Advance">Gameboy Advance</option>
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
                    <button className="link-button" onClick={() => handleEditGameDetails(game)}>
                      Edit
                    </button>
                  </p>
                  <p>
                    <Link to="#" onClick={() => handleRemoveGame(game.GameId)}>
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
              <span> Page {currentPage} of {Math.ceil(collectionItems.length / itemsPerPage)} </span>
              <button onClick={handleNextPage} disabled={currentPage === Math.ceil(collectionItems.length / itemsPerPage)}>
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MyCollection;
