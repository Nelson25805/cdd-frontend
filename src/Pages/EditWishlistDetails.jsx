// src/Pages/EditWishlistDetails.jsx
import { useState, useEffect } from 'react';
import '../App.css';
import { useUser } from '../Context/useUser';
import TopLinks from '../Context/TopLinks';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchWishlistDetails, editWishlistDetails, fetchGameInfo } from '../Api';

export default function EditWishlistDetails() {
  const { user } = useUser();
  const userId = user?.userid;
  const navigate = useNavigate();
  const gameId = new URLSearchParams(useLocation().search).get('q');

  // No more allConsoles state
  const [available, setAvailable] = useState([]);
  const [selected,  setSelected]  = useState([]);
  const [title,     setTitle]     = useState('…');
  const [cover,     setCover]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    if (!userId || !gameId) return;

    (async () => {
      // 1️⃣ Fetch game-info + all consoles
      const gi = await fetchGameInfo(gameId);
      let consoles = [];
      if (gi.success) {
        setTitle(gi.gameDetails.title);
        setCover(
          gi.gameDetails.coverart
            ? `data:image/png;base64,${gi.gameDetails.coverart}`
            : null
        );
        consoles = gi.gameDetails.consoles; // raw array
      }

      // 2️⃣ Fetch existing wishlist consoles
      const wl = await fetchWishlistDetails(userId, gameId);
      const pickedIds = wl.consoles.map((c) => c.consoleid);

      // 3️⃣ Derive available & selected from that fetched `consoles`
      setSelected(   consoles.filter((c) => pickedIds.includes(c.consoleid)) );
      setAvailable( consoles.filter((c) => !pickedIds.includes(c.consoleid)) );

      setLoading(false);
    })();
  }, [userId, gameId]);

  const addC = (c) => {
    setSelected(s => [...s, c].sort((a, b) => a.name.localeCompare(b.name)));
    setAvailable(a => a.filter(x => x.consoleid !== c.consoleid));
  };
  const remC = (c) => {
    setAvailable(a => [...a, c].sort((a, b) => a.name.localeCompare(b.name)));
    setSelected(s => s.filter(x => x.consoleid !== c.consoleid));
  };

  const handleSave = async () => {
    setError('');
    if (selected.length === 0) {
      setError('Select at least one platform.');
      return;
    }
    const ids = selected.map(c => c.consoleid);
    const res = await editWishlistDetails(userId, gameId, { consoleIds: ids });
    if (res.success) {
      alert('Wishlist updated!');
      navigate('/MyWishlist');
    } else {
      setError('Save failed.');
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="App">
      <TopLinks user={user} />
      <div className="game-information">
        <div className="left-section">
          <p className="game-information-titles">Title</p>
          <input value={title} disabled />
          <p className="game-information-titles">Cover</p>
          <div className="display-image">
            {cover ? <img src={cover} /> : 'No image'}
          </div>
          <button onClick={handleSave} className="add-game-button">Save</button>
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="right-section">
          <p className="game-information-titles">Platform(s)</p>
          <div className="dual-list-container">
            <div className="list available">
              <h4>Available</h4>
              <div className="list-body">
                {available.map(c => (
                  <div key={c.consoleid} onClick={() => addC(c)}>
                    {c.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="list selected">
              <h4>Selected</h4>
              <div className="list-body">
                {selected.map(c => (
                  <div key={c.consoleid}>
                    <span>{c.name}</span>
                    <button onClick={() => remC(c)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
