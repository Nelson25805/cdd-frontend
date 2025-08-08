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

  // Normalize whatever your API returns into a predictable shape:
  // { id, otherId, otherUsername, otherAvatar, unseen }
  const normalizeThreads = raw =>
    (raw || []).map(t => ({
      id: t.id ?? t.threadId ?? t.thread_id,
      otherId:
        t.otherId ??
        t.other_user?.userid ??
        t.other_user?.id ??
        t.other_user?.userId ??
        t.other_user_id ??
        null,
      otherUsername:
        t.otherUsername ??
        t.other_user?.username ??
        t.other_name ??
        t.username ??
        'Unknown',
      otherAvatar:
        t.otherAvatar ??
        t.other_user?.avatar ??
        t.other_avatar ??
        t.other_user?.avatar_url ??
        null,
      unseen:
        typeof t.unseen === 'boolean'
          ? t.unseen
          : typeof t.unread === 'boolean'
            ? t.unread
            : typeof t.has_unseen === 'boolean'
              ? t.has_unseen
              : (t.unseen_count ?? t.unread_count ?? 0) > 0
    }));

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

      // fetch threads for *logged-in* user (inbox)
      const rawThreads = await getUserThreads();
      setThreads(normalizeThreads(rawThreads));
    })().catch(console.error);
  }, [id]);

  if (!profile) return <div>Loading…</div>;

  const isOwn = Number(id) === user.userid;

  // ─── Friend-request handlers (unchanged) ─────────────────
  const handleAccept = async targetId => {
    try {
      await acceptFriendRequest(targetId);
      setIncoming(i => i.filter(u => u.id !== targetId));
      const accepted = incoming.find(u => u.id === targetId);
      if (accepted) setFriends(f => [...f, { ...accepted, friendedAt: new Date().toISOString() }]);
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
  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(id);
    } catch (err) {
      console.error('Send request failed', err);
    }
  };

  // Open conversation: behave exactly like "Message" button in Friends section
  const openConversation = thread => {
    const target = thread.otherId ?? thread.id;
    if (!target) {
      return navigate(`/messages/${thread.id}`);
    }
    navigate(`/messages/${target}`);
  };

  // === New: total unseen count for the header badge ===
  const totalUnseen = threads.reduce((acc, t) => acc + (t.unseen ? 1 : 0), 0);

  // small badge styles (inline for convenience)
  const headerBadge = {
    display: 'inline-block',
    minWidth: 18,
    padding: '2px 6px',
    borderRadius: 12,
    background: '#e53935',
    color: 'white',
    fontSize: '0.75rem',
    marginLeft: 8,
    textAlign: 'center'
  };

  const dotStyle = {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#e53935',
    boxShadow: '0 0 0 2px white'
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

      {/* Section Tabs */}
      <div className="section-selector" style={{ display: 'flex', gap: 8 }}>
        {sections.map(sec => (
          <div
            key={sec}
            className={`section-option ${sec === selectedSection ? 'active' : ''}`}
            onClick={() => setSelectedSection(sec)}
            style={{ cursor: 'pointer', position: 'relative', padding: '6px 10px' }}
          >
            {sec}
            {sec === 'Inbox' && totalUnseen > 0 && (
              // header-level badge next to the "Inbox" tab label
              <span style={headerBadge}>{totalUnseen}</span>
            )}
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
                <li key={u.id} className="friend-item" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  <span style={{ flex:1 }}>{u.username}</span>
                  <button className="tiny-button" onClick={() => navigate(`/messages/${u.id}`)}>Message</button>
                  <button className="tiny-button" onClick={() => handleRemoveFriend(u.id)}>Remove</button>
                </li>
              ))}
            </ul>

            <h2>Incoming ({incoming.length})</h2>
            <ul>
              {incoming.map(u => (
                <li key={u.id} className="friend-item" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  <span style={{ flex:1 }}>{u.username} <small>sent at {new Date(u.sentAt).toLocaleDateString()}</small></span>
                  <button className="tiny-button" onClick={() => handleAccept(u.id)}>Accept</button>
                  <button className="tiny-button" onClick={() => handleDecline(u.id)}>Decline</button>
                </li>
              ))}
            </ul>

            <h2>Outgoing ({outgoing.length})</h2>
            <ul>
              {outgoing.map(u => (
                <li key={u.id} className="friend-item" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  <span style={{ flex:1 }}>{u.username} <small>sent at {new Date(u.sentAt).toLocaleDateString()}</small></span>
                  <button className="tiny-button" onClick={() => handleCancelOutgoing(u.id)}>Cancel</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* —–– Inbox Tab —–– */}
        {selectedSection === 'Inbox' && (
          <section className="inbox-list">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Your Conversations
              {/* inbox-level badge also shown here for clarity */}
              {totalUnseen > 0 && <span style={headerBadge}>{totalUnseen}</span>}
            </h2>

            {threads.length === 0 ? (
              <p>No conversations yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {threads.map(t => (
                  <li key={t.id}
                      className="thread-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 0',
                        borderBottom: '1px solid #eee'
                      }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <div style={{ position: 'relative' }}>
                        <img src={t.otherAvatar || defaultAvatar}
                             alt={t.otherUsername}
                             className="tiny-avatar"
                             style={{ width:32, height:32, borderRadius: '50%' }} />
                        {t.unseen && <span style={dotStyle} aria-hidden />}
                      </div>

                      <div style={{ display:'flex', flexDirection:'column' }}>
                        <div style={{ fontSize: '0.95rem' }}>Messages from: <strong>{t.otherUsername}</strong></div>
                        {t.unseen ? <div style={{ fontSize:'0.8rem', color:'#e53935' }}>New message</div> : null}
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => openConversation(t)}
                        className="small-button"
                        style={{ marginRight: 8 }}
                      >
                        Open
                      </button>
                    </div>
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
