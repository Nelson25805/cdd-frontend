// src/Pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getUserProfile,
  getUserCollection,
  getUserWishlist
} from '../Api';
import CoverImage from '../Context/CoverImage';
// import default avatar from src/assets
import defaultAvatar from '../assets/default-avatar.jpg';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getUserProfile(id);
        setProfile(p);
        setCollection(await getUserCollection(id));
        setWishlist(await getUserWishlist(id));
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    })();
  }, [id]);

  if (!profile) return <div>Loading profile…</div>;

  return (
    <div className="App">
      <h1>{profile.username}</h1>

      <CoverImage
        cover={profile.avatar || defaultAvatar}
        alt={profile.username}
      />

      {profile.isFriend ? (
        <button
          className="small-button"
          onClick={() => navigate(`/messages/${profile.chatThreadId}`)}
        >
          Message
        </button>
      ) : (
        <button className="small-button" onClick={() => {/* send/friend logic */ }}>
          Add Friend
        </button>
      )}

      <h2>{profile.username}’s Collection</h2>
      <div className="game-list">
        {collection.length
          ? collection.map(g => (
            <div key={g.GameId} className="game-item-small">
              <Link to={`/GameDetails?q=${g.GameId}`}>
                <CoverImage cover={g.CoverArt} alt={g.Name} />
                <p>{g.Name}</p>
              </Link>
            </div>
          ))
          : <p>No games in collection</p>
        }
      </div>

      <h2>{profile.username}’s Wishlist</h2>
      <div className="game-list">
        {wishlist.length
          ? wishlist.map(g => (
            <div key={g.GameId} className="game-item-small">
              <Link to={`/WishlistDetails?q=${g.GameId}`}>
                <CoverImage cover={g.CoverArt} alt={g.Name} />
                <p>{g.Name}</p>
              </Link>
            </div>
          ))
          : <p>No games in wishlist</p>
        }
      </div>
    </div>
  );
}
