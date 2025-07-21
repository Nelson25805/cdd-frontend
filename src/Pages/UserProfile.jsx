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
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [requestSent, setRequestSent] = useState(false);

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);

  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

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

  // send / cancel outgoing to this profile user
  const handleAddFriend = async () => {
    await sendFriendRequest(id);
    setRequestSent(true);
  };
  const handleCancelRequest = async () => {
    await cancelFriendRequest(id);
    setRequestSent(false);
  };

  // incoming requests
  const handleAccept = async (requesterId) => {
    await acceptFriendRequest(requesterId);
    const accepted = incoming.find(u => u.id === requesterId);
    setIncoming(prev => prev.filter(u => u.id !== requesterId));
    if (accepted) {
      setFriends(prev => [
        ...prev,
        { ...accepted, friendedAt: new Date().toISOString() }
      ]);
    }
  };
  const handleDecline = async (requesterId) => {
    await declineFriendRequest(requesterId);
    setIncoming(prev => prev.filter(u => u.id !== requesterId));
  };

  // outgoing requests
  const handleCancelOutgoing = async (targetId) => {
    await cancelFriendRequest(targetId);
    setOutgoing(prev => prev.filter(u => u.id !== targetId));
  };

  // When “Remove” clicked, show inline confirm buttons
  const promptRemove = friendId => {
    setConfirmRemoveId(friendId);
  };

  // User clicks “Cancel”
  const cancelRemove = () => {
    setConfirmRemoveId(null);
  };

  // User clicks “Confirm”
  const confirmRemove = async friendId => {
    await unfriend(friendId);
    setFriends(f => f.filter(u => u.id !== friendId));
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

        <h2>Incoming Requests ({incoming.length})</h2>
        <ul>
          {incoming.map(u => (
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
                onClick={() => handleAccept(u.id)}
              >
                Accept
              </button>
              <button
                className="tiny-button"
                onClick={() => handleDecline(u.id)}
              >
                Decline
              </button>
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
