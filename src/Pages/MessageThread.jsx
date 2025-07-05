import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import {
  getMessages,
  sendMessage,
  getIncomingFriendRequests,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  unfriend
} from '../Api';

export default function MessageThread() {
  const { thread } = useParams();
  const navigate = useNavigate();

  const isInbox = thread === 'inbox';
  const isLobby = thread === 'friends';   // new
  const isChat = !isInbox && !isLobby;

  // — Inbox state —
  const [requests, setRequests] = useState([]);

  // — Lobby state —
  const [friends, setFriends] = useState([]);

  // — Chat state —
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  // 1) Load pending friend requests
  useEffect(() => {
    if (!isInbox) return;
    (async () => {
      const data = await getIncomingFriendRequests();
      setRequests(data);
    })();
  }, [isInbox]);

  // 2) Load friends lobby
  useEffect(() => {
    if (!isLobby) return;
    (async () => {
      try {
        const list = await getFriends();
        setFriends(list);
      } catch (err) {
        console.error('Error loading friends list:', err);
      }
    })();
  }, [isLobby]);

  // 3) Poll chat every 2s
  useEffect(() => {
    // only poll when we’ve got a real thread id
    if (!thread || isInbox || isLobby) return;
    let id = setInterval(async () => {
      const msgs = await getMessages(thread);
      setMessages(msgs);
    }, 2000);
    return () => clearInterval(id);
  }, [thread, isInbox, isLobby]);

  const onSend = async () => {
    if (!draft.trim()) return;
    await sendMessage(thread, draft);
    setDraft('');
    const msgs = await getMessages(thread);
    setMessages(msgs);
  };

  const handleAccept = async requesterId => {
    const { threadId } = await acceptFriendRequest(requesterId);
    navigate(`/messages/${threadId}`);
  };
  const handleDecline = async requesterId => {
    await cancelFriendRequest(requesterId);
    setRequests(r => r.filter(r => r.requesterId !== requesterId));
  };

  return (
    <div className="App">
      <TopLinks />

      {/* Inbox view */}
      {isInbox && (
        <>
          <h1>Friend Requests</h1>
          {requests.length === 0
            ? <p>No pending requests.</p>
            : <ul>
              {requests.map(r => (
                <li key={r.requesterId}>
                  {r.username}
                  <button onClick={() => handleAccept(r.requesterId)}>Accept</button>
                  <button onClick={() => handleDecline(r.requesterId)}>Decline</button>
                </li>
              ))}
            </ul>
          }
        </>
      )}

      {/* Friends lobby */}
      {isLobby && (
        <>
          <h1>Your Friends</h1>
          {friends.length === 0
            ? <p>You have no friends yet.</p>
            : <ul>
              {friends.map(f => (
                <li key={f.id}>
                  {f.username}
                  <button onClick={() => navigate(`/messages/${f.threadId}`)}>
+                     Chat
+                   </button>
+                   <button
                     className="small-button"
                     onClick={async () => {
                       try {
                         await unfriend(f.id);
                         // reload your lobby list
                         const updated = await getFriends();
                         setFriends(updated);
                       } catch (err) {
                         console.error('Unfriend failed', err);
                       }
                     }}
                   >
                     Unfriend
                   </button>
                </li>
              ))}
            </ul>
          }
        </>
      )}

      {/* Chat thread */}
      {isChat && (
        <>
          <h1>Chat</h1>
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
    </div>
  );
}
