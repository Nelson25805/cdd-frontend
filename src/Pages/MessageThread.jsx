// src/Pages/MessageThread.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import {
  getUserProfile,
  getThreadMessages,
  sendMessageToThread,
  getIncomingFriendRequests,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  unfriend
} from '../Api';

export default function MessageThread() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const isInbox = userId === 'inbox';
  const isLobby = userId === 'friends';
  const isChat = !!userId && !isInbox && !isLobby;

  // inbox state
  const [requests, setRequests] = useState([]);

  // lobby state
  const [friends, setFriends] = useState([]);

  // chat state
  const [resolvedThreadId, setResolvedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  // 1) Inbox
  useEffect(() => {
    if (!isInbox) return;
    (async () => {
      const data = await getIncomingFriendRequests();
      setRequests(data);
    })();
  }, [isInbox]);

  // 2) Lobby
  useEffect(() => {
    if (!isLobby) return;
    (async () => {
      const list = await getFriends();
      setFriends(list);
    })();
  }, [isLobby]);

  // 3) Resolve real thread ID before chatting
  useEffect(() => {
    if (!isChat) return;
    (async () => {
      try {
        const profile = await getUserProfile(userId);
        setResolvedThreadId(profile.chatThreadId);
      } catch (err) {
        console.error('Failed to resolve chat thread:', err);
      }
    })();
  }, [userId, isChat]);

  // 4) Poll messages every 2s once we have a thread ID
  useEffect(() => {
    if (!resolvedThreadId) return;
    const id = setInterval(async () => {
      const msgs = await getThreadMessages(resolvedThreadId);
      setMessages(msgs);
    }, 2000);
    return () => clearInterval(id);
  }, [resolvedThreadId]);

  const onSend = async () => {
    if (!draft.trim() || !resolvedThreadId) return;
    await sendMessageToThread(resolvedThreadId, draft);
    setDraft('');
    // immediately refresh
    const msgs = await getThreadMessages(resolvedThreadId);
    setMessages(msgs);
  };

  const handleAccept = async requesterId => {
    const { threadId } = await acceptFriendRequest(requesterId);
    navigate(`/messages/${threadId}`);  // now threadId is numeric, not 'user' param
  };
  const handleDecline = async requesterId => {
    await cancelFriendRequest(requesterId);
    setRequests(r => r.filter(r => r.requesterId !== requesterId));
  };

  return (
    <div className="App">
      <TopLinks />

      {isInbox && (
        <>
          <h1>Friend Requests</h1>
          {requests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <ul>
              {requests.map(r => (
                <li key={r.requesterId}>
                  {r.username}
                  <button onClick={() => handleAccept(r.requesterId)}>
                    Accept
                  </button>
                  <button onClick={() => handleDecline(r.requesterId)}>
                    Decline
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {isLobby && (
        <>
          <h1>Your Friends</h1>
          {friends.length === 0 ? (
            <p>You have no friends yet.</p>
          ) : (
            <ul>
              {friends.map(f => (
                <li key={f.id}>
                  {f.username}
                  <button onClick={() => navigate(`/messages/${f.id}`)}>
                    Chat
                  </button>
                  <button
                    onClick={async () => {
                      await unfriend(f.id);
                      const updated = await getFriends();
                      setFriends(updated);
                    }}
                  >
                    Unfriend
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {isChat && (
        <>
          <h1>Chat</h1>
          {!resolvedThreadId ? (
            <p>Loading conversation…</p>
          ) : (
            <>
              <div className="message-list">
                {messages.map(m => (
                  <div key={m.id}>
                    <strong>{m.senderName}:</strong> {m.text}
                  </div>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Type…"
                rows={3}
              />
              <button onClick={onSend}>Send</button>
            </>
          )}
        </>
      )}
    </div>
  );
}
