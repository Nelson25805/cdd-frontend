import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import TopLinks from '../Context/TopLinks';
import Footer from '../Context/Footer';
import { useUser } from '../Context/useUser';
import { getWishlist, removeFromWishlist, getUserProfile } from '../Api';
import '../App.css';
import { useNavigate, useParams } from 'react-router-dom';

import { useSortFilter } from '../Context/useSortFilter';
import SortFilterControls from '../Context/SortFilterControls';
import CoverImage from '../Context/CoverImage';

function MyWishlist() {
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const ownUserId = user?.userid;

  // route param (optional)
  const { userId: routeUserId } = useParams();
  const displayedUserId = routeUserId || ownUserId;

  // Do NOT initialize with the numeric id — start empty so we never show an id.
  const [displayedUsername, setDisplayedUsername] = useState('');

  const isViewingOwnWishlist = !routeUserId || Number(routeUserId) === Number(ownUserId);

  // sorting/filter controls
  const { sortDirection, filterConsole } = useSortFilter();

  const handlePrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

  // Reset some state synchronously on route change to avoid flashing old content
  useLayoutEffect(() => {
    setWishlistItems([]);
    setCurrentPage(1);
    setIsLoading(true);
    // immediate safe heading: own username if viewing own, otherwise keep blank
    if (!routeUserId) {
      setDisplayedUsername(user?.username ?? '');
    } else {
      setDisplayedUsername('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUserId, user?.username]);

  // Fetch wishlist items
  const fetchWishlistItems = useCallback(async () => {
    if (!displayedUserId) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { results } = await getWishlist(displayedUserId, token);
      setWishlistItems(results || []);
      setItemsLoaded(true);
    } catch (err) {
      console.error(err);
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [displayedUserId]);

  useEffect(() => {
    if (!userLoading) fetchWishlistItems();
  }, [userLoading, fetchWishlistItems]);

  // fetch nicer username async (but never set numeric id)
  useEffect(() => {
    let mounted = true;
    if (!routeUserId) {
      setDisplayedUsername(user?.username ?? '');
      return () => { mounted = false; };
    }

    (async () => {
      try {
        const prof = await getUserProfile(routeUserId);
        if (!mounted) return;
        setDisplayedUsername(prof?.username ?? '');
      } catch (err) {
        if (!mounted) return;
        setDisplayedUsername('');
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

  const handleRemove = async (gameId) => {
    if (!isViewingOwnWishlist) return;
    try {
      const token = localStorage.getItem('token');
      await removeFromWishlist(displayedUserId, gameId, token);
      setWishlistItems(items => items.filter(g => g.GameId !== gameId));
      alert('Removed from wishlist');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResults = wishlistItems.filter(g =>
    filterConsole === 'All'
      ? true
      : Array.isArray(g.Consoles)
        ? g.Consoles.some(c => c.name === filterConsole)
        : false
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    const dir = sortDirection === 'Ascending' ? 1 : -1;
    return a.Name.localeCompare(b.Name) * dir;
  });

  const start = (currentPage - 1) * itemsPerPage;
  const pageResults = sortedResults.slice(start, start + itemsPerPage);
  const rawTotal = Math.ceil(filteredResults.length / itemsPerPage);
  const totalPages = rawTotal > 0 ? rawTotal : 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const heading = isViewingOwnWishlist ? 'My Wishlist' : (displayedUsername ? `${displayedUsername}’s Wishlist` : 'Wishlist');

  if (userLoading) return <div>Loading user data…</div>;

  return (
    <div className="App">
      <TopLinks />
      <h2>{heading}</h2>

      <div className="search-content">
        <main className="search-main-content">
          <SortFilterControls />

          <div className="game-section">
            {(!itemsLoaded && loadingDots) && <p>Loading…{loadingDots}</p>}

            <div className="game-item-header">
              <div className="game-item-header-photo"><p>Photo</p></div>
              <div className="game-item-header-name-console">
                <p className="game-item-header-name">Name</p>
                <p>Console</p>
              </div>
              {isViewingOwnWishlist && <div className="game-item-header-actions"><p>Actions</p></div>}
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

                {isViewingOwnWishlist && (
                  <div className="game-item-actions">
                    <button className="link-button" onClick={() => navigate(`/EditWishlistDetails?q=${game.GameId}`)}>Edit</button>
                    <span> | </span>
                    <button className="link-button" onClick={() => handleRemove(game.GameId)}>Remove</button>
                  </div>
                )}
              </div>
            ))}

            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
              <span> Page {currentPage} of {totalPages} </span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}>Next</button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default MyWishlist;
