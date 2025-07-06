// src/Pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getUserProfile,
  getUserCollection,
  getUserWishlist,
  getUserIncomingRequests,
  getUserOutgoingRequests,
  getUserFriends,
  sendFriendRequest,
  cancelFriendRequest
} from '../Api';
import CoverImage from '../Context/CoverImage';
import defaultAvatar from '../assets/default-avatar.jpg';
import TopLinks from '../Context/TopLinks';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]       = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist]     = useState([]);
  const [requestSent, setRequestSent] = useState(false);

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends]   = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const p  = await getUserProfile(id);
      setProfile(p);
      setRequestSent(!!p.requestSent);
      setCollection(await getUserCollection(id));
      setWishlist(await getUserWishlist(id));

      // ** new calls **
      setIncoming(await getUserIncomingRequests(id));
      setOutgoing(await getUserOutgoingRequests(id));
      setFriends(await getUserFriends(id));
    })().catch(console.error);
  }, [id]);

  if (!profile) return <div>Loading profile…</div>;

  // Handlers for friend requests
  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(id);
      setRequestSent(true);
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await cancelFriendRequest(id);
      setRequestSent(false);
    } catch (err) {
      console.error('Failed to cancel friend request:', err);
    }
  };

  return (
    <div className="App">
      <TopLinks />
      <h1>{profile.username}’s Profile</h1>

      <CoverImage
        cover={profile.avatar || defaultAvatar}
        alt={profile.username}
        className="profile-avatar"
      />

      <h2>Game Stats</h2>
      <div className="profile-stats">
        <Link to={`/users/${id}/collection`} className="stat-card">
          <h3>Collection</h3>
          <p>{collection.length} {collection.length === 1 ? 'game' : 'games'}</p>
        </Link>
        <Link to={`/users/${id}/wishlist`} className="stat-card">
          <h3>Wishlist</h3>
          <p>{wishlist.length} {wishlist.length === 1 ? 'game' : 'games'}</p>
        </Link>
      </div>

      {/* Friend / messaging button */}
      {profile.isFriend ? (
        <button
          className="small-button"
          onClick={() => navigate(`/messages/${profile.chatThreadId}`)}
        >
          Message
        </button>
      ) : requestSent ? (
        <button className="small-button" onClick={handleCancelRequest}>
          Cancel Request
        </button>
      ) : (
        <button className="small-button" onClick={handleAddFriend}>
          Add Friend
        </button>
      )}
    <section className="friend-lists">
        <h2>Friends ({friends.length})</h2>
        <ul>
          {friends.map(u => (
            <li key={u.id}>
              <img src={u.avatar} alt="" className="tiny-avatar"/>
              {u.username}
            </li>
          ))}
        </ul>

        <h2>Pending Incoming Requests ({incoming.length})</h2>
        <ul>
          {incoming.map(u => (
            <li key={u.id}>
              <img src={u.avatar} alt="" className="tiny-avatar"/>
              {u.username} <small>sent at {new Date(u.sentAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>

        <h2>Pending Outgoing Requests ({outgoing.length})</h2>
        <ul>
          {outgoing.map(u => (
            <li key={u.id}>
              <img src={u.avatar} alt="" className="tiny-avatar"/>
              {u.username} <small>sent at {new Date(u.sentAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
