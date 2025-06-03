import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import { getWishlist, removeFromWishlist } from '../Api';
import '../App.css';

// 1️⃣ shared context + controls
import { useSortFilter } from '../Context/useSortFilter';
import SortFilterControls from '../Context/SortFilterControls';

function MyWishlist() {
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [wishlistItems, setWishlistItems] = useState([]);
  const [, setLoading] = useState(false);

  const { user, loading: userLoading } = useUser();
  const userId = user?.userid;

  // 2️⃣ get context values
  const { sortDirection, filterConsole } = useSortFilter();

  const handleNextPage = () => setCurrentPage((p) => p + 1);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const fetchWishlistItems = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { results } = await getWishlist(userId, token);
      setWishlistItems(results || []);
      setItemsLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userLoading) fetchWishlistItems();
  }, [userLoading, fetchWishlistItems]);

  // loading dots
  useEffect(() => {
    const id = setInterval(() => {
      setLoadingDots((d) => (d.length < 3 ? d + '.' : '.'));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRemove = async (gameId) => {
    try {
      const token = localStorage.getItem('token');
      await removeFromWishlist(userId, gameId, token);
      setWishlistItems(wishlistItems.filter(g => g.GameId !== gameId));
      alert('Removed from wishlist');
    } catch (err) {
      console.error(err);
    }
  };

  if (userLoading) return <div>Loading user data…</div>;

  // 3️⃣ filter, sort, paginate
  const applySortAndFilter = () => {
    const filtered = wishlistItems.filter(g =>
      filterConsole === 'All' ? true : g.Console === filterConsole
    );
    filtered.sort((a, b) => {
      const dir = sortDirection === 'Ascending' ? 1 : -1;
      return a.Name.localeCompare(b.Name) * dir;
    });
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(
    wishlistItems.filter(g =>
      filterConsole === 'All' ? true : g.Console === filterConsole
    ).length / itemsPerPage
  );

  return (
    <div className="App">
      <TopLinks />
      <h2>My Wishlist</h2>
      <div className="search-content">
        <main className="search-main-content">

          {/* 4️⃣ shared controls */}
          <SortFilterControls />

          <div className="game-section">
            {(!itemsLoaded && loadingDots) && <p>Loading…{loadingDots}</p>}

            <div className="game-item-header">
              <div className="game-item-header-photo"><p>Photo</p></div>
              <div className="game-item-header-name-console">
                <p className="game-item-header-name">Name</p>
                <p>Console</p>
              </div>
              <div className="game-item-header-actions"><p>Actions</p></div>
            </div>

            {applySortAndFilter().map(game => (
              <div key={game.GameId} className="game-item">
                <img src={`data:image/png;base64,${game.CoverArt}`} alt={game.Name} />
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
                      {(Array.isArray(game.Consoles) ? game.Consoles : [game.Console])
                        .map(c => <div key={c} className="console-item">{c}</div>)}
                    </div>
                  </div>
                </div>
                <div className="game-item-actions">
                  <Link to="#" onClick={() => handleRemove(game.GameId)}>
                    Remove
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

          </div>
        </main>
      </div>
    </div>
  );
}

export default MyWishlist;
