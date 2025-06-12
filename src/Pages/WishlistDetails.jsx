// src/Pages/WishlistDetails.jsx
import { useState, useEffect } from 'react';
import '../App.css';
import { useUser } from '../Context/useUser';
import TopLinks from '../Context/TopLinks';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchGameInfo, addToWishlist } from '../Api';

export default function WishlistDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const gameId = new URLSearchParams(location.search).get('q');
    const { user } = useUser();
    const userId = user?.userid;
    const [gameDetails, setGameDetails] = useState({ title: '', coverart: null });
    const [availableConsoles, setAvailableConsoles] = useState([]);
    const [selectedConsoles, setSelectedConsoles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!gameId) return;
        (async () => {
            const res = await fetchGameInfo(gameId);
            if (res.success) {
                setGameDetails({ title: res.gameDetails.title, coverart: res.gameDetails.coverart });
                setAvailableConsoles(res.gameDetails.consoles);
            } else {
                alert(res.message);
            }
        })();
    }, [gameId]);

    const addConsole = c => {
        setSelectedConsoles(sc => [...sc, c]);
        setAvailableConsoles(ac => ac.filter(x => x.consoleid !== c.consoleid));
    };
    const removeConsole = c => {
        setAvailableConsoles(ac => [...ac, c]);
        setSelectedConsoles(sc => sc.filter(x => x.consoleid !== c.consoleid));
    };

    const handleSave = async () => {
        setError('');
        if (selectedConsoles.length === 0) {
            setError('Please pick at least one platform.');
            return;
        }
        try {
            await addToWishlist(userId, Number(gameId), selectedConsoles.map(c => c.consoleid));
            navigate('/mywishlist');
        } catch {
            alert('Error adding to wishlist.');
        }
    };

    return (
        <div className="App">
            <TopLinks user={user} />
            <div className="left-section">
                <p className="game-information-titles">Title</p>
                <input value={gameDetails.title} disabled />
                <p className="game-information-titles">Cover Art</p>
                <div className="display-image">
                    {gameDetails.coverart ? (
                        <img src={`data:image/png;base64,${gameDetails.coverart}`} alt="" />
                    ) : (
                        'No image'
                    )}
                </div>
                <button onClick={handleSave} className="add-game-button">
                    Add to Wishlist
                </button>
                {error && <p className="error-text">{error}</p>}
            </div>

            <div className="right-section">
                <p className="game-information-titles">Platforms</p>
                <div className="dual-list-container">
                    <div className="list available">
                        <h4>Available</h4>
                        <div className="list-body">
                            {availableConsoles.map(c => (
                                <div key={c.consoleid} onClick={() => addConsole(c)}>
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="list selected">
                        <h4>Selected</h4>
                        <div className="list-body">
                            {selectedConsoles.map(c => (
                                <div key={c.consoleid}>
                                    {c.name} <button onClick={() => removeConsole(c)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
