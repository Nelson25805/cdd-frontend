import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import { fetchCollectionItems, removeGameFromCollection } from '../Api';
import '../App.css';

// 1️⃣ Import the context hook and controls component
import { useSortFilter } from '../Context/useSortFilter';
import SortFilterControls from '../Context/SortFilterControls';

export default function MyCollection() {
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [collectionItems, setCollectionItems] = useState([]);

  const [, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.userid;

  // 2️⃣ Grab sort/filter values from context
  const { sortDirection, filterConsole } = useSortFilter();

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  // fetch only when userId changes
  const fetchItems = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const items = await fetchCollectionItems(userId);
      setCollectionItems(items || []);
      setItemsLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Loading dots animation
  useEffect(() => {
    const id = setInterval(() => {
      setLoadingDots((d) => (d.length < 3 ? d + '.' : '.'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRemoveGame = async (gameId) => {
    try {
      await removeGameFromCollection(userId, gameId);
      alert('Removed from collection');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditGameDetails = (game) => {
    navigate(`/editgamedetails?q=${encodeURIComponent(game.GameId)}`);
  };

  // 3️⃣ Build one filtered array
  const filteredResults = collectionItems.filter((g) => {
    if (filterConsole === 'All') return true;
    return Array.isArray(g.Consoles)
      ? g.Consoles.some((c) => c.name === filterConsole)
      : false;
  });

  // 4️⃣ Sort it
  const sortedResults = [...filteredResults].sort((a, b) => {
    const dir = sortDirection === 'Ascending' ? 1 : -1;
    return a.Name.localeCompare(b.Name) * dir;
  });

  // 5️⃣ Slice out this page
  const start = (currentPage - 1) * itemsPerPage;
  const pageResults = sortedResults.slice(start, start + itemsPerPage);

  // 6️⃣ Compute total pages (ensure at least 1)
  const rawTotal = Math.ceil(filteredResults.length / itemsPerPage);
  const totalPages = rawTotal > 0 ? rawTotal : 1;

  // 7️⃣ Clamp currentPage if filter reduces totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="App">
      <TopLinks />
      <h2>My Collection</h2>
      <div className="search-content">
        <main className="search-main-content">

          {/* 4️⃣ shared controls */}
          <SortFilterControls />

          <div className="game-section">
            {!itemsLoaded && <p>Loading…{loadingDots}</p>}

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
                <img
                  src={`data:image/jpg;base64,${game.CoverArt}`}
                  alt={game.Name}
                />

                <div className="game-item-name-console">
                  {/* Name */}
                  <div className="name-cell">
                    <div className="name-list">
                      <p className="game-item-name">{game.Name}</p>
                    </div>
                  </div>

                  {/* Consoles */}
                  <div className="console-cell">
                    <div className="console-list">
                      {(Array.isArray(game.Consoles) ? game.Consoles.map(c => c.name) : [])
                        .sort((a, b) => a.localeCompare(b))
                        .map((name) => (
                          <div key={name} className="console-item">
                            {name}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="game-item-actions">
                  <button
                    className="link-button"
                    onClick={() => handleEditGameDetails(game)}
                  >
                    Edit
                  </button>
                  <span> | </span>
                  <button
                    className="link-button"
                    onClick={() => handleRemoveGame(game.GameId)}
                  >
                    Remove
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
          </div>
        </main>
      </div>
    </div>
  );
}
