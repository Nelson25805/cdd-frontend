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
  getUserThreads,
} from '../Api';
import CoverImage from '../Context/CoverImage';
import defaultAvatar from '../assets/default-avatar.jpg';
import TopLinks from '../Context/TopLinks';

export default function UserProfile() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [threads, setThreads] = useState([]);

  // tab state
  const sections = ['Stats', 'Friends', 'Inbox'];
  const [selectedSection, setSelectedSection] = useState(sections[0]);

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
      setThreads(await getUserThreads());           // fetch all your threads
    })().catch(console.error);
  }, [id]);

  if (!profile) return <div>Loading…</div>;

  const isOwn = Number(id) === user.userid;

  return (
    <div className="App">
      <TopLinks />

      <h1>{profile.username}’s Profile</h1>
      <CoverImage cover={profile.avatar || defaultAvatar}
        alt={profile.username}
        className="profile-avatar" />

      {/* section tabs */}
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
                  <img src={u.avatar || defaultAvatar}
                    className="tiny-avatar" alt="" />
                  {u.username}
                  <button onClick={() => navigate(`/messages/${u.id}`)}
                    className="tiny-button">
                    Message
                  </button>
                  <button onClick={() => {/* remove logic */ }}
                    className="tiny-button">
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <h2>Incoming ({incoming.length})</h2>
            <ul>
              {incoming.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar}
                    className="tiny-avatar" alt="" />
                  {u.username}
                  <button onClick={() => {/* accept */ }}
                    className="tiny-button">Accept</button>
                  <button onClick={() => {/* decline */ }}
                    className="tiny-button">Decline</button>
                </li>
              ))}
            </ul>

            <h2>Outgoing ({outgoing.length})</h2>
            <ul>
              {outgoing.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar}
                    className="tiny-avatar" alt="" />
                  {u.username}
                  <button onClick={() => {/* cancel */ }}
                    className="tiny-button">Cancel</button>
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
                  <li
                    key={t.id}
                    className="thread-item"
                  >
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
