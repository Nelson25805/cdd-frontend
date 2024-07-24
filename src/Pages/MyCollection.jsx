// Importing React hooks and components from 'react'
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Importing context and components
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/UserContext';

// Importing styles
import '../App.css';

// Functional component for the My Collection page
/*This component is used to show all the games currently in a users collection.
You're able to remove, or edit the game's contents to the users liking. */
function MyCollection() {
  // State for managing loading status, sort direction, filter console, current page, and collection items
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [filterConsole, setFilterConsole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [collectionItems, setCollectionItems] = useState([]);

  // State for loading and error handling during API requests
  const [, setLoading] = useState(false);

  // Accessing the navigate function from React Router
  const navigate = useNavigate();

  // Accessing user data from the user context
  const { user } = useUser();
  const { userId } = user || {};

  // Event handlers for navigating to the next and previous pages
  const handleNextPage = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  // Callback function for fetching collection items
  const fetchCollectionItems = useCallback(async () => {
    try {
      if (!userId) {
        // If userId is not available, do not proceed with the request
        return;
      }

      setLoading(true);
      const response = await fetch(`https://capstonebackend-mdnh.onrender.com/api/mycollection/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCollectionItems(data.results);
        setItemsLoaded(true);
      } else {
        console.error('Failed to fetch collection items:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching collection items:', error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Function for applying sort and filter to the collection items
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

  // Effect to fetch collection items on component mount and when dependencies change
  useEffect(() => {
    fetchCollectionItems();
  }, [userId, sortDirection, filterConsole, currentPage, fetchCollectionItems]);

  // Effect to update loading dots every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : '.'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Function to remove a game from the collection
  const removeGameFromCollection = async (gameId) => {
    try {
      const response = await fetch(`https://capstonebackend-mdnh.onrender.com/api/removecollection/${userId}/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Game was removed successfully from collection.')
        // Fetch updated collection items
        fetchCollectionItems();
      } else {
        console.error('Failed to remove game:', response.statusText);
      }
    } catch (error) {
      console.error('Error removing game:', error.message);
    }
  };

  // Function to navigate to the EditGameDetails page for a specific game
  const handleEditGameDetails = async (game) => {

    // User does not have a record with details, navigate to the page
    navigate(`/editgamedetails?q=${encodeURIComponent(game.GameId)}`);
  };

  // Render UI component
  return (
    <div className="App">
      {/* TopLinks component for rendering top navigation links */}
      <TopLinks />
      <h2>My Collection</h2>
      <div className="search-content">
        {/* Main content section for sorting, filtering, and displaying collection items */}
        <main className="search-main-content">
          {/* Section for sorting and filtering options */}
          <div className="sort-filter-section">
            <p>Sort & Filter</p>
            {/* Dropdown for sorting by ascending or descending order */}
            <div>
              <p>Sort By:</p>
              <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
                <option value="Ascending">Ascending</option>
                <option value="Descending">Descending</option>
              </select>
            </div>
            {/* Dropdown for filtering by console */}
            <div>
              <p>Filter By Console:</p>
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

          {/* Section for displaying collection items */}
          <div className="game-section">
            {/* Loading message while fetching results */}
            {(!itemsLoaded && loadingDots) && (
              <p>Loading results please wait ..{loadingDots}</p>
            )}
            {/* Header for the collection items */}
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
            {/* Mapping through sorted and filtered collection items to render each game */}
            {applySortAndFilter().map((game, index) => (
              <div key={game.GameId} className="game-item">
                <img src={`data:image/png;base64,${game.CoverArt}`} alt={game.Name} />
                <div className='game-item-name-console'>
                  <p className='game-item-name'>{game.Name}</p>
                  <p>{game.Console}</p>
                </div>
                <div className='game-item-actions'>
                  <p>
                    {/* Button to edit game details */}
                    <button className="link-button"
                      onClick={() => handleEditGameDetails(game)}
                    >
                      Edit
                    </button>
                  </p>
                  <p>
                    {/* Link to remove game from collection */}
                    <Link to="#" onClick={() => removeGameFromCollection(game.GameId)}>
                      Remove
                    </Link>
                  </p>
                </div>
              </div>
            ))}
            {/* Pagination buttons */}
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
