import { useState, useEffect, useCallback } from 'react';
import TopLinks from '../Context/TopLinks';
import Footer from '../Context/Footer';
import { useUser } from '../Context/useUser';
import { getWishlist, removeFromWishlist } from '../Api';
import '../App.css';
import { useNavigate } from 'react-router-dom';

import { useSortFilter } from '../Context/useSortFilter';
import SortFilterControls from '../Context/SortFilterControls';
import CoverImage from '../Context/CoverImage';

function MyWishlist() {
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [wishlistItems, setWishlistItems] = useState([]);
  const [, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loading: userLoading } = useUser();
  const userId = user?.userid;

  // 2️⃣ get context values
  const { sortDirection, filterConsole } = useSortFilter();

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

  // 3️⃣ Build one filtered array…
  const filteredResults = wishlistItems.filter(g =>
    filterConsole === 'All'
      ? true
      : Array.isArray(g.Consoles)
        ? g.Consoles.some(c => c.name === filterConsole)
        : false
  );

  // 4️⃣ Sort it
  const sortedResults = [...filteredResults].sort((a, b) => {
    const dir = sortDirection === 'Ascending' ? 1 : -1;
    return a.Name.localeCompare(b.Name) * dir;
  });

  // 5️⃣ Slice out just this page
  const start = (currentPage - 1) * itemsPerPage;
  const pageResults = sortedResults.slice(start, start + itemsPerPage);

  // 6️⃣ Compute total pages
  const rawTotal = Math.ceil(filteredResults.length / itemsPerPage);
  const totalPages = rawTotal > 0 ? rawTotal : 1;


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

            {pageResults.map(game => (
              <div key={game.GameId} className="game-item">
                <div className="game-item-photo">
                  <CoverImage cover={game.CoverArt} alt={game.Name} />
                </div>
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
                      {game.Consoles
                        .map(c => c.name)
                        .sort((a, b) => a.localeCompare(b))
                        .map(name => (
                          <div key={name} className="console-item">
                            {name}
                          </div>
                        ))}
                    </div>
                  </div>



                </div>
                <div className="game-item-actions">
                  <button className="link-button" onClick={() => navigate(`/EditWishlistDetails?q=${game.GameId}`)}>
                    Edit
                  </button>
                  <span> | </span>
                  <button className="link-button" onClick={() => handleRemove(game.GameId)}>
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
                disabled={currentPage >= totalPages}>
                Next
              </button>
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default MyWishlist;
