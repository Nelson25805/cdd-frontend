import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../Context/useUser';          // ← pull in your hook
import {
  getUserProfile,
  getUserCollection,
  getUserWishlist,
  getUserIncomingRequests,
  getUserOutgoingRequests,
  getUserFriends,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend
} from '../Api';
import CoverImage from '../Context/CoverImage';
import defaultAvatar from '../assets/default-avatar.jpg';
import TopLinks from '../Context/TopLinks';

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useUser();                         // ← current user
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [requestSent, setRequestSent] = useState(false);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  // Fetch everything
  useEffect(() => {
    if (!id) return;
    (async () => {
      const p = await getUserProfile(id);
      setProfile(p);
      setRequestSent(!!p.requestSent);
      setCollection(await getUserCollection(id));
      setWishlist(await getUserWishlist(id));
      setIncoming(await getUserIncomingRequests(id));
      setOutgoing(await getUserOutgoingRequests(id));
      setFriends(await getUserFriends(id));
    })().catch(console.error);
  }, [id]);

  if (!profile) return <div>Loading profile…</div>;

  // Are we looking at *our own* profile?
  const isOwnProfile = Number(id) === user.userid;

  // Friend / message handlers
  const handleAddFriend = async () => {
    await sendFriendRequest(id);
    setRequestSent(true);
  };
  const handleCancelRequest = async () => {
    await cancelFriendRequest(id);
    setRequestSent(false);
  };
  const handleAccept = async rId => {
    await acceptFriendRequest(rId);
    setIncoming(i => i.filter(u => u.id !== rId));
    const accepted = incoming.find(u => u.id === rId);
    if (accepted) setFriends(f => [...f, { ...accepted, friendedAt: new Date().toISOString() }]);
  };
  const handleDecline = async rId => {
    await declineFriendRequest(rId);
    setIncoming(i => i.filter(u => u.id !== rId));
  };
  const handleCancelOutgoing = async tId => {
    await cancelFriendRequest(tId);
    setOutgoing(o => o.filter(u => u.id !== tId));
  };
  const promptRemove = fid => setConfirmRemoveId(fid);
  const cancelRemove = () => setConfirmRemoveId(null);
  const confirmRemove = async fid => {
    await unfriend(fid);
    setFriends(f => f.filter(u => u.id !== fid));
    setConfirmRemoveId(null);
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

      {/*
        If *not* our own profile, show the Message / Cancel / Add Friend buttons
      */}
      {!isOwnProfile && (
        profile.isFriend ? (
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
        )
      )}

      <section className="friend-lists">
        <h2>Friends ({friends.length})</h2>
        <ul>
          {friends.map(u => (
            <li key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={u.avatar || defaultAvatar}
                alt={`${u.username}'s avatar`}
                className="tiny-avatar"
              />
              <span style={{ flexGrow: 1 }}>{u.username}</span>
              <button
                className="tiny-button"
                onClick={() => navigate(`/messages/${u.id}`)}
              >
                Message
              </button>
              {confirmRemoveId === u.id ? (
                <>
                  <span className="confirm-text">
                    Are you sure you want to remove {u.username}?
                  </span>
                  <button
                    className="tiny-button confirm"
                    onClick={() => confirmRemove(u.id)}
                  >
                    Confirm
                  </button>
                  <button
                    className="tiny-button cancel"
                    onClick={cancelRemove}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="tiny-button"
                  onClick={() => promptRemove(u.id)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        <h2>Outgoing Requests ({outgoing.length})</h2>
        <ul>
          {outgoing.map(u => (
            <li key={u.id}>
              <img
                src={u.avatar || defaultAvatar}
                alt={`${u.username}'s avatar`}
                className="tiny-avatar"
              />
              {u.username}&nbsp;
              <small>sent at {new Date(u.sentAt).toLocaleDateString()}</small>
              <button
                className="tiny-button"
                onClick={() => handleCancelOutgoing(u.id)}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
