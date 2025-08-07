import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../Context/useUser';
import {
  getUserProfile,
  getUserCollection,
  getUserWishlist,
  getUserIncomingRequests,
  getUserOutgoingRequests,
  getUserFriends,
  acceptFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
  cancelFriendRequest,
  unfriend,
  getUserThreads,
} from '../Api';
import CoverImage from '../Context/CoverImage';
import defaultAvatar from '../assets/default-avatar.jpg';
import TopLinks from '../Context/TopLinks';

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist,   setWishlist]   = useState([]);
  const [incoming,   setIncoming]   = useState([]);
  const [outgoing,   setOutgoing]   = useState([]);
  const [friends,    setFriends]    = useState([]);
  const [threads,    setThreads]    = useState([]);

  const sections = ['Stats', 'Friends', 'Inbox'];
  const [selectedSection, setSelectedSection] = useState(sections[0]);

  // — Load everything once —
  useEffect(() => {
    if (!id) return;
    (async () => {
      const p = await getUserProfile(id);
      setProfile(p);
      setCollection(await getUserCollection(id));
      setWishlist(await getUserWishlist(id));
      setIncoming(await getUserIncomingRequests(id));
      setOutgoing(await getUserOutgoingRequests(id));
      setFriends(await getUserFriends(id));
      setThreads(await getUserThreads());
    })().catch(console.error);
  }, [id]);

  if (!profile) return <div>Loading…</div>;

  const isOwn = Number(id) === user.userid;

  // ─── Friend-request handlers ─────────────────────────────

  const handleAccept = async targetId => {
    try {
      await acceptFriendRequest(targetId);
      setIncoming(i => i.filter(u => u.id !== targetId));
      const accepted = incoming.find(u => u.id === targetId);
      if (accepted) {
        setFriends(f => [...f, { ...accepted, friendedAt: new Date().toISOString() }]);
      }
    } catch (err) {
      console.error('Accept failed', err);
    }
  };

  const handleDecline = async targetId => {
    try {
      await declineFriendRequest(targetId);
      setIncoming(i => i.filter(u => u.id !== targetId));
    } catch (err) {
      console.error('Decline failed', err);
    }
  };

  const handleCancelOutgoing = async targetId => {
    try {
      await cancelFriendRequest(targetId);
      setOutgoing(o => o.filter(u => u.id !== targetId));
    } catch (err) {
      console.error('Cancel request failed', err);
    }
  };

  const handleRemoveFriend = async friendId => {
    try {
      await unfriend(friendId);
      setFriends(f => f.filter(u => u.id !== friendId));
    } catch (err) {
      console.error('Unfriend failed', err);
    }
  };

  // ─── Add Friend / Cancel Request on someone else's profile ─────────────────────────────
  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(id);
      // you might want to refetch outgoing or flip a flag
    } catch (err) {
      console.error('Send request failed', err);
    }
  };

  // —──────────────────────────────────────────────────────────

  return (
    <div className="App">
      <TopLinks />

      <h1>{profile.username}’s Profile</h1>
      <CoverImage
        cover={profile.avatar || defaultAvatar}
        alt={profile.username}
        className="profile-avatar"
      />

      {/* Section Tabs */}
      <div className="section-selector">
        {sections.map(sec => (
          <div
            key={sec}
            className={`section-option ${sec === selectedSection ? 'active' : ''}`}
            onClick={() => setSelectedSection(sec)}
          >
            {sec}
          </div>
        ))}
      </div>

      <div className="profile-sections">

        {/* —–– Stats Tab —–– */}
        {selectedSection === 'Stats' && (
          <div className="stats-section">
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
          </div>
        )}

        {/* —–– Friends Tab —–– */}
        {selectedSection === 'Friends' && (
          <section className="friend-lists">

            <h2>Friends ({friends.length})</h2>
            <ul>
              {friends.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  {u.username}
                  <button
                    className="tiny-button"
                    onClick={() => navigate(`/messages/${u.id}`)}
                  >
                    Message
                  </button>
                  <button
                    className="tiny-button"
                    onClick={() => handleRemoveFriend(u.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <h2>Incoming ({incoming.length})</h2>
            <ul>
              {incoming.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  {u.username}
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

            <h2>Outgoing ({outgoing.length})</h2>
            <ul>
              {outgoing.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  {u.username}
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
        )}

        {/* —–– Inbox Tab —–– */}
        {selectedSection === 'Inbox' && (
          <section className="inbox-list">
            <h2>Your Conversations</h2>
            {threads.length === 0 ? (
              <p>No conversations yet.</p>
            ) : (
              <ul>
                {threads.map(t => (
                  <li key={t.id} className="thread-item">
                    <img
                      src={t.otherAvatar || defaultAvatar}
                      alt={t.otherUsername}
                      className="tiny-avatar"
                    />
                    Messages from: <strong>{t.otherUsername}</strong>
                    <button
                      onClick={() => navigate(`/messages/${t.id}`)}
                      className="small-button"
                    >
                      Open
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
