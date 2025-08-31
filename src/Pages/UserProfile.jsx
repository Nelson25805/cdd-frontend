// src/Pages/UserProfile.jsx
import { useState, useEffect, useLayoutEffect } from 'react';
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

  // ─── Hooks (ALL declared unconditionally at top) ─────────────────
  const [profile, setProfile] = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [threads, setThreads] = useState([]);

  // confirm states for destructive actions (only used on your own profile)
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [confirmDeclineId, setConfirmDeclineId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // Tabs
  const allSections = ['Stats', 'Friends', 'Inbox'];
  const [selectedSection, setSelectedSection] = useState(allSections[0]);

  // compute isOwn early (not a hook)
  const isOwn = Number(id) === user.userid;

  // Normalize threads helper (pure; no hooks)
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

  // reset visible state synchronously when route :id changes to avoid flashing previous profile
  useLayoutEffect(() => {
    // clear the previous profile immediately (paint will happen with cleared state)
    setProfile(null);
    setCollection([]);
    setWishlist([]);
    setIncoming([]);
    setOutgoing([]);
    setFriends([]);
    setThreads([]);

    // clear any pending confirm prompts
    setConfirmRemoveId(null);
    setConfirmDeclineId(null);
    setConfirmCancelId(null);

    // reset tab to the first allowed section
    setSelectedSection(allSections[0]);
  }, [id]);


  // — Load everything once whenever :id changes —
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getUserProfile(id);
        setProfile(p);

        setCollection(await getUserCollection(id));
        setWishlist(await getUserWishlist(id));
        setIncoming(await getUserIncomingRequests(id));
        setOutgoing(await getUserOutgoingRequests(id));
        setFriends(await getUserFriends(id));

        const rawThreads = await getUserThreads();
        setThreads(normalizeThreads(rawThreads));
      } catch (err) {
        console.error('Profile load error', err);
      }
    })();
  }, [id]);

  // Ensure selectedSection is valid when switching between own/other profile
  useEffect(() => {
    const allowedSections = isOwn ? allSections : ['Stats'];
    if (!allowedSections.includes(selectedSection)) {
      setSelectedSection(allowedSections[0]);
    }
    // we only depend on id/isOwn here; selectedSection is safe to update
  }, [id, isOwn]); // no lint disable needed

  // ─── Friend-request handlers ─────────────────
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

  const promptDecline = targetId => setConfirmDeclineId(targetId);
  const cancelPromptDecline = () => setConfirmDeclineId(null);
  const confirmDecline = async targetId => {
    try {
      await declineFriendRequest(targetId);
      setIncoming(i => i.filter(u => u.id !== targetId));
    } catch (err) {
      console.error('Decline failed', err);
    } finally {
      setConfirmDeclineId(null);
    }
  };

  const promptCancelOutgoing = targetId => setConfirmCancelId(targetId);
  const cancelPromptCancelOutgoing = () => setConfirmCancelId(null);
  const confirmCancelOutgoing = async targetId => {
    try {
      await cancelFriendRequest(targetId);
      setOutgoing(o => o.filter(u => u.id !== targetId));
    } catch (err) {
      console.error('Cancel request failed', err);
    } finally {
      setConfirmCancelId(null);
    }
  };

  const promptRemoveFriend = friendId => setConfirmRemoveId(friendId);
  const cancelPromptRemove = () => setConfirmRemoveId(null);
  const confirmRemoveFriend = async friendId => {
    try {
      await unfriend(friendId);
      setFriends(f => f.filter(u => u.id !== friendId));
    } catch (err) {
      console.error('Unfriend failed', err);
    } finally {
      setConfirmRemoveId(null);
    }
  };

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(id);
    } catch (err) {
      console.error('Send request failed', err);
    }
  };

  const openConversation = thread => {
    const target = thread.otherId ?? thread.id;
    if (!target) return navigate(`/messages/${thread.id}`);
    navigate(`/messages/${target}`);
  };

  const totalUnseen = threads.reduce((acc, t) => acc + (t.unseen ? 1 : 0), 0);

  // ─── Rendering (after all hooks are declared) ─────────────────
  if (!profile) return <div>Loading…</div>;

  const allowedSections = isOwn ? allSections : ['Stats'];

  return (
    <div className="App">
      <TopLinks />

      <h1>{profile.username}’s Profile</h1>
      <CoverImage
        cover={profile.avatar || defaultAvatar}
        alt={profile.username}
        className="profile-avatar"
      />

      <div className="section-selector">
        {allowedSections.map(sec => (
          <div
            key={sec}
            className={`section-option ${sec === selectedSection ? 'active' : ''}`}
            onClick={() => setSelectedSection(sec)}
          >
            {sec}
            {sec === 'Inbox' && totalUnseen > 0 && (
              <span className="inbox-badge">{totalUnseen}</span>
            )}
          </div>
        ))}
      </div>

      <div className="profile-sections">
        {/* Stats */}
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

            {!isOwn && (
              <div style={{ marginTop: 12 }}>
                {profile.isFriend ? (
                  <button className="small-button" onClick={() => navigate(`/messages/${profile.chatThreadId}`)}>Message</button>
                ) : (
                  <button className="small-button" onClick={handleAddFriend}>Add Friend</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Friends (only on own profile) */}
        {selectedSection === 'Friends' && isOwn && (
          <section className="friend-lists">
            <h2>Friends ({friends.length})</h2>
            <ul>
              {friends.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  <span className="friend-name">{u.username}</span>

                  <button className="tiny-button" onClick={() => navigate(`/messages/${u.id}`)}>Message</button>
                  <button className="tiny-button" onClick={() => navigate(`/users/${u.id}`)}>View Profile</button>

                  {confirmRemoveId === u.id ? (
                    <div className="confirm-row">
                      <span className="confirm-text">Are you sure you want to remove {u.username}?</span>
                      <div className="confirm-buttons">
                        <button className="tiny-button confirm" onClick={() => confirmRemoveFriend(u.id)}>Confirm</button>
                        <button className="tiny-button cancel" onClick={cancelPromptRemove}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="tiny-button" onClick={() => promptRemoveFriend(u.id)}>Remove</button>
                  )}
                </li>
              ))}
            </ul>

            <h2>Incoming ({incoming.length})</h2>
            <ul>
              {incoming.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  <span className="friend-name">{u.username} <small>sent at {new Date(u.sentAt).toLocaleDateString()}</small></span>

                  <button className="tiny-button" onClick={() => handleAccept(u.id)}>Accept</button>

                  {confirmDeclineId === u.id ? (
                    <div className="confirm-row">
                      <span className="confirm-text">Decline request from {u.username}?</span>
                      <div className="confirm-buttons">
                        <button className="tiny-button confirm" onClick={() => confirmDecline(u.id)}>Confirm</button>
                        <button className="tiny-button cancel" onClick={cancelPromptDecline}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="tiny-button" onClick={() => promptDecline(u.id)}>Decline</button>
                  )}
                </li>
              ))}
            </ul>

            <h2>Outgoing ({outgoing.length})</h2>
            <ul>
              {outgoing.map(u => (
                <li key={u.id} className="friend-item">
                  <img src={u.avatar || defaultAvatar} className="tiny-avatar" alt="" />
                  <span className="friend-name">{u.username} <small>sent at {new Date(u.sentAt).toLocaleDateString()}</small></span>

                  {confirmCancelId === u.id ? (
                    <div className="confirm-row">
                      <span className="confirm-text">Cancel request to {u.username}?</span>
                      <div className="confirm-buttons">
                        <button className="tiny-button confirm" onClick={() => confirmCancelOutgoing(u.id)}>Confirm</button>
                        <button className="tiny-button cancel" onClick={cancelPromptCancelOutgoing}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="tiny-button" onClick={() => promptCancelOutgoing(u.id)}>Cancel</button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Inbox (only on own profile) */}
        {selectedSection === 'Inbox' && isOwn && (
          <section className="inbox-list">
            <h2>
              Your Conversations
              {totalUnseen > 0 && <span className="inbox-badge">{totalUnseen}</span>}
            </h2>

            {threads.length === 0 ? (
              <p>No conversations yet.</p>
            ) : (
              <ul>
                {threads.map(t => (
                  <li key={t.id} className="thread-item">
                    <div className="thread-avatar-container">
                      <div className="avatar-wrapper">
                        <img src={t.otherAvatar || defaultAvatar} alt={t.otherUsername} className="thread-avatar" />
                        {t.unseen && <span className="thread-unseen-dot" aria-hidden />}
                      </div>
                      <div className="thread-meta">
                        <div>Messages from: <strong>{t.otherUsername}</strong></div>
                        {t.unseen && <div className="thread-new-text">New message</div>}
                      </div>
                    </div>
                    <div>
                      <button onClick={() => openConversation(t)} className="small-button thread-open-button">Open</button>
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
