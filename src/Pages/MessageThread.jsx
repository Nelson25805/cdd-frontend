// src/Pages/MessageThread.jsx
import { useState, useEffect } from 'react';
//import { useParams, useNavigate } from 'react-router-dom';
import { useParams,} from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import {
  getMessages,
  sendMessage,
  getIncomingFriendRequests,
  acceptFriendRequest,
  cancelFriendRequest
} from '../Api';

export default function MessageThread() {
  const { thread } = useParams();
  //const navigate = useNavigate();
  const isInbox = thread === 'inbox';

  // ——— Inbox state ———
  const [requests, setRequests] = useState([]);

  // ——— Chat state ———
  const [messages, setMessages] = useState([]);
  const [draft,    setDraft]    = useState('');

  // Fetch inbox once
  useEffect(() => {
    if (!isInbox) return;
    (async () => {
      try {
        const data = await getIncomingFriendRequests();
        setRequests(data);
      } catch (err) {
        console.error('Error loading friend requests:', err);
      }
    })();
  }, [isInbox]);

  // Poll chat every 2s
  useEffect(() => {
    if (isInbox) return;
    let id = setInterval(async () => {
      try {
        const msgs = await getMessages(thread);
        setMessages(msgs);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [thread, isInbox]);

  const onSend = async () => {
    if (!draft.trim()) return;
    try {
      await sendMessage(thread, draft);
      setDraft('');
      const msgs = await getMessages(thread);
      setMessages(msgs);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleAccept = async requesterId => {
    try {
      await acceptFriendRequest(requesterId);
      // after accepting, supabase creates the chat thread; fetch its ID
      // simplest: reload profile or navigate to new thread, but here we'll just remove the request
      setRequests(r => r.filter(req => req.requesterId !== requesterId));
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleDecline = async requesterId => {
    try {
      await cancelFriendRequest(requesterId);
      setRequests(r => r.filter(req => req.requesterId !== requesterId));
    } catch (err) {
      console.error('Error declining request:', err);
    }
  };

  return (
    <div className="App">
      <TopLinks />
      {isInbox ? (
        <>
          <h1>Friend Requests</h1>
          {requests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <ul className="request-list">
              {requests.map(r => (
                <li key={r.requesterId} className="request-item">
                  <strong>{r.username}</strong>
                  <button
                    className="small-button"
                    onClick={() => handleAccept(r.requesterId)}
                  >
                    Accept
                  </button>
                  <button
                    className="small-button"
                    onClick={() => handleDecline(r.requesterId)}
                  >
                    Decline
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <h1>Chat Thread</h1>
          <div className="message-list">
            {messages.map(m => (
              <div key={m.id} className="message-item">
                <strong>{m.senderName}:</strong> {m.text}
              </div>
            ))}
          </div>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Type your message…"
            rows={3}
          />
          <button onClick={onSend} className="small-button">
            Send
          </button>
        </>
      )}
    </div>
  );
}
