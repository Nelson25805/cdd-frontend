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
import TopLinks from '../Context/TopLinks';

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
      <TopLinks />
      <h1>{profile.username} Profile Page</h1>

      <CoverImage
        cover={profile.avatar || defaultAvatar}
        alt={profile.username}
        className="profile-avatar"
      />

      <h2>Game Stats</h2>
      <div className="profile-stats">
        <Link to={`/users/${id}/collection`} className="stat-card">
          <h3>My Collection</h3>
          <p>{collection.length} {collection.length === 1 ? 'game' : 'games'}</p>
        </Link>
        <Link to={`/users/${id}/wishlist`} className="stat-card">
          <h3>Wishlist</h3>
          <p>{wishlist.length} {wishlist.length === 1 ? 'game' : 'games'}</p>
        </Link>
      </div>

      {profile.isFriend ? (
        <button
          className="small-button"
          onClick={() => navigate(`/messages/${profile.chatThreadId}`)}
        >
          Message
        </button>
      ) : (
        <button
          className="small-button"
          onClick={() => {/* send/friend logic */ }}
        >
          Add Friend
        </button>
      )}
    </div>
  );
}
