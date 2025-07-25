import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import {
  fetchCollectionItems,
  removeGameFromCollection
} from '../Api';
import { useSortFilter } from '../Context/useSortFilter';
import SortFilterControls from '../Context/SortFilterControls';
import CoverImage from '../Context/CoverImage';
import '../App.css';

export default function MyCollection() {
  const [, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [collectionItems, setCollectionItems] = useState([]);

  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const ownUserId = user?.userid;

  // If route has a userId param, we're viewing someone else's collection
  const { userId: routeUserId } = useParams();
  // Determine which ID to fetch
  const displayedUserId = routeUserId || ownUserId;

  const { sortDirection, filterConsole } = useSortFilter();

  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  // Fetch collection for either the route user or yourself
  const fetchItems = useCallback(async () => {
    if (!displayedUserId) return;
    setIsLoadingItems(true);
    try {
      const items = await fetchCollectionItems(displayedUserId);
      setCollectionItems(items || []);
      setItemsLoaded(true);
    } catch (err) {
      console.error('Error fetching collection:', err);
    } finally {
      setIsLoadingItems(false);
    }
  }, [displayedUserId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // loading dots
  useEffect(() => {
    const id = setInterval(() => {
      setLoadingDots(d => (d.length < 3 ? d + '.' : '.'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRemoveGame = async (gameId) => {
    try {
      await removeGameFromCollection(displayedUserId, gameId);
      alert('Removed from collection');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditGameDetails = (game) => {
    navigate(`/editgamedetails?q=${encodeURIComponent(game.GameId)}`);
  };

  // filter, sort, paginate (unchanged)
  const filtered = collectionItems.filter(g => {
    if (filterConsole === 'All') return true;
    return Array.isArray(g.Consoles)
      ? g.Consoles.some(c => c.name === filterConsole)
      : false;
  });
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDirection === 'Ascending' ? 1 : -1;
    return a.Name.localeCompare(b.Name) * dir;
  });
  const start = (currentPage - 1) * itemsPerPage;
  const pageResults = sorted.slice(start, start + itemsPerPage);
  const rawTotal = Math.ceil(filtered.length / itemsPerPage);
  const totalPages = rawTotal > 0 ? rawTotal : 1;
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Heading text
  const heading = routeUserId
    ? `User ${routeUserId}’s Collection`
    : 'My Collection';

  return (
    <div className="App">
      <TopLinks />
      <h2>{heading}</h2>

      <div className="search-content">
        <main className="search-main-content">
          <SortFilterControls />

          <div className="game-section">
            {isLoadingItems
              ? <p>Loading{loadingDots}</p>
              : (
                <>
                  <div className="game-item-header">
                    <div className="game-item-header-photo"><p>Photo</p></div>
                    <div className="game-item-header-name-console">
                      <p className="game-item-header-name">Name</p>
                      <p>Console</p>
                    </div>
                    <div className="game-item-header-actions"><p>Actions</p></div>
                  </div>

                  {pageResults.map(game => (
                    <div key={game.GameId} className="game-item">
                      <div className="game-item-photo">
                        <CoverImage cover={game.CoverArt} alt={game.Name} />
                      </div>
                      <div className="game-item-name-console">
                        <div className="name-cell">
                          <div className="name-list">
                            <p className="game-item-name">{game.Name}</p>
                          </div>
                        </div>
                        <div className="console-cell">
                          <div className="console-list">
                            {(Array.isArray(game.Consoles) ? game.Consoles.map(c => c.name) : [])
                              .sort((a, b) => a.localeCompare(b))
                              .map(name => (
                                <div key={name} className="console-item">{name}</div>
                              ))}
                          </div>
                        </div>
                      </div>
                      {!routeUserId && (
                        <div className="game-item-actions">
                          <button
                            className="link-button"
                            onClick={() => handleEditGameDetails(game)}
                          >Edit</button>
                          <span> | </span>
                          <button
                            className="link-button"
                            onClick={() => handleRemoveGame(game.GameId)}
                          >Remove</button>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pagination-controls">
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                    >Next</button>
                  </div>
                </>
              )
            }
          </div>
        </main>
      </div>
    </div>
  );
}
