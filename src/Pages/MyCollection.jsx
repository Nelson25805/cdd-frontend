// src/Pages/MyCollection.jsx
import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import Footer from '../Context/Footer';
import { useUser } from '../Context/useUser';
import {
  fetchCollectionItems,
  removeGameFromCollection,
  getUserProfile,
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

  // route user id (if viewing someone else's collection)
  const { userId: routeUserId } = useParams();

  // The ID we actually fetch
  const displayedUserId = routeUserId || ownUserId;

  const { sortDirection, filterConsole } = useSortFilter();

  // displayed username for heading (only populated for other users)
  const [displayedUsername, setDisplayedUsername] = useState(null);

  // Synchronous "are we viewing our own collection?" state to avoid flicker
  const [isViewingOwnCollection, setIsViewingOwnCollection] = useState(
    // conservative default: if routeUserId is missing we treat as own; if present, false until we compute
    !routeUserId
  );

  // Heading ready flag: don't show heading for other's page until we have username
  const [headingReady, setHeadingReady] = useState(!routeUserId);

  // === Reset synchronously before paint to prevent old content flicker ===
  useLayoutEffect(() => {
    // Clear previous items immediately
    setCollectionItems([]);
    setCurrentPage(1);
    setIsLoadingItems(true);

    // Synchronously determine whether this looks like our own collection
    const own = !routeUserId || (ownUserId !== undefined && Number(routeUserId) === Number(ownUserId));
    setIsViewingOwnCollection(own);

    // If it's our collection, heading is ready immediately; otherwise wait for async username fetch
    setHeadingReady(own);
    if (own) {
      // set username from context immediately for heading
      setDisplayedUsername(user?.username ?? null);
    } else {
      // reset previously visible username to avoid showing previous user's name
      setDisplayedUsername(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUserId, ownUserId, user?.username]);

  // Fetch collection for either the route user or yourself
  const fetchItems = useCallback(async () => {
    if (!displayedUserId) {
      setCollectionItems([]);
      setIsLoadingItems(false);
      return;
    }
    setIsLoadingItems(true);
    try {
      const items = await fetchCollectionItems(displayedUserId);
      setCollectionItems(items || []);
      setItemsLoaded(true);
    } catch (err) {
      console.error('Error fetching collection:', err);
      setCollectionItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, [displayedUserId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // If viewing someone else's page, fetch that user's profile (username)
  useEffect(() => {
    let mounted = true;
    if (!routeUserId) {
      // own collection — heading already handled by useLayoutEffect above
      setDisplayedUsername(user?.username ?? null);
      setHeadingReady(true);
      return;
    }

    // async load username — only set headingReady true once we have it
    (async () => {
      try {
        const p = await getUserProfile(routeUserId);
        if (!mounted) return;
        setDisplayedUsername(p?.username ?? `User ${routeUserId}`);
      } catch (err) {
        if (!mounted) return;
        setDisplayedUsername(`User ${routeUserId}`);
      } finally {
        if (!mounted) return;
        setHeadingReady(true);
      }
    })();

    return () => { mounted = false; };
  }, [routeUserId, user?.username]);

  // loading dots
  useEffect(() => {
    const id = setInterval(() => {
      setLoadingDots(d => (d.length < 3 ? d + '.' : '.'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  const handleRemoveGame = async (gameId) => {
    // only allow removal if viewing own collection
    if (!isViewingOwnCollection) return;
    try {
      await removeGameFromCollection(displayedUserId, gameId);
      alert('Removed from collection');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditGameDetails = (game) => {
    if (!isViewingOwnCollection) return;
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

  // Heading text - only show when headingReady
  const heading = isViewingOwnCollection
    ? 'My Collection'
    : (displayedUsername ? `${displayedUsername}’s Collection` : '');

  return (
    <div className="App">
      <TopLinks />
      {/* Render nothing (or a small loading) until headingReady for other-user pages */}
      {headingReady ? <h2>{heading}</h2> : <h2>Loading…</h2>}

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
                    {/* only show Actions header when viewing own collection and headingReady */}
                    {headingReady && isViewingOwnCollection && (
                      <div className="game-item-header-actions"><p>Actions</p></div>
                    )}
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

                      {/* only show edit/remove when viewing own collection and headingReady */}
                      {headingReady && isViewingOwnCollection && (
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
      <Footer />
    </div>
  );
}
