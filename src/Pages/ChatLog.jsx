// src/Pages/ChatLog.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import { getThreadMessages, sendMessageToThread } from '../Api';

export default function ChatLog() {
  const { threadId } = useParams();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef();

  // 1) Load the chat log once on mount (or when threadId changes)
  useEffect(() => {
    if (!threadId) return;
    (async () => {
      const raw = await getThreadMessages(threadId);
      // remap to a consistent shape
      setMessages(raw.map(m => ({
        id:        m.messageid,
        text:      m.content,
        fromMe:    m.senderid === user.userid,
        timestamp: new Date(m.dateadded)
      })));
    })();
  }, [threadId, user.userid]);

  // 2) Auto‑scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3) Send a new message
  const handleSend = async e => {
    e.preventDefault();
    if (!draft.trim()) return;

    // send to server
    const sent = await sendMessageToThread(threadId, draft);

    // append to local state
    setMessages(prev => [
      ...prev,
      {
        id:        sent.messageid,
        text:      sent.content,
        fromMe:    sent.senderid === user.userid,
        timestamp: new Date(sent.dateadded)
      }
    ]);

    setDraft('');
  };

  return (
    <div className="App chat-page">
      <TopLinks />
      <h1>Conversation</h1>

      <div className="chat-log" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {messages.map(m => (
          <div
            key={m.id}
            className={m.fromMe ? 'msg me' : 'msg them'}
            style={{
              textAlign: m.fromMe ? 'right' : 'left',
              margin: '0.5em 0'
            }}
          >
            <p style={{ display: 'inline-block', padding: '0.5em', borderRadius: '8px', background: m.fromMe ? '#DCF8C6' : '#EEE' }}>
              {m.text}
            </p>
            <div style={{ fontSize: '0.75em', color: '#666' }}>
              {m.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend} style={{ marginTop: '1em' }}>
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type your message…"
          style={{ width: '80%', padding: '0.5em' }}
        />
        <button type="submit" style={{ padding: '0.5em 1em', marginLeft: '0.5em' }}>
          Send
        </button>
      </form>
    </div>
  );
}
