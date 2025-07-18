import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import {
  getUserProfile,
  getThreadMessages,
  sendMessageToThread
} from '../Api';

export default function ChatPage() {
  const { user } = useUser();
  const { userId } = useParams();     // the friend’s userId
  const navigate = useNavigate();

  const [threadId, setThreadId] = useState(null);
  const [messages,  setMessages] = useState([]);
  const [draft,     setDraft]    = useState('');
  const bottomRef = useRef();

  // 1) If no userId, go back
  useEffect(() => {
    if (!userId) {
      navigate(-1);
    }
  }, [userId, navigate]);

  // 2) Resolve or create the thread via profile endpoint
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const profile = await getUserProfile(userId);
        setThreadId(profile.chatThreadId);
      } catch (err) {
        console.error('Could not get chatThreadId:', err);
      }
    })();
  }, [userId]);

  // 3) Poll messages every 2s once we have a threadId
  useEffect(() => {
    if (!threadId) return;
    let stop = false;
    const fetchLoop = async () => {
      if (stop) return;
      try {
        const msgs = await getThreadMessages(threadId);
        setMessages(msgs.map(m => ({
          id:        m.messageid,
          text:      m.content,
          fromMe:    m.senderid === user.userid,
          timestamp: new Date(m.dateadded)
        })));
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
      setTimeout(fetchLoop, 2000);
    };
    fetchLoop();
    return () => { stop = true; };
  }, [threadId, user.userid]);

  // 4) Auto‑scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5) Send a message
  const handleSend = async e => {
    e.preventDefault();
    if (!draft.trim() || !threadId) return;
    try {
      const sent = await sendMessageToThread(threadId, draft);
      setDraft('');
      // immediately append
      setMessages(ms => [
        ...ms,
        {
          id:        sent.messageid,
          text:      sent.content,
          fromMe:    sent.senderid === user.userid,
          timestamp: new Date(sent.dateadded)
        }
      ]);
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  return (
    <div className="App chat-page">
      <TopLinks />
      <h1>Chat with {userId}</h1>

      <div className="chat-log" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1em' }}>
        {messages.map(m => (
          <div
            key={m.id}
            style={{
              textAlign: m.fromMe ? 'right' : 'left',
              margin: '0.5em 0'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '0.5em 1em',
                borderRadius: '16px',
                background: m.fromMe ? '#DCF8C6' : '#EEE',
                maxWidth: '60%'
              }}
            >
              {m.text}
            </span>
            <div style={{ fontSize: '0.75em', color: '#666' }}>
              {m.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', padding: '1em' }}>
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type a message…"
          style={{ flex: 1, padding: '0.5em' }}
        />
        <button type="submit" style={{ marginLeft: '0.5em', padding: '0.5em 1em' }}>
          Send
        </button>
      </form>
    </div>
  );
}
