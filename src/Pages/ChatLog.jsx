// src/Pages/ChatLog.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getThreadMessages, sendMessageToThread } from '../Api';
import TopLinks from '../Context/TopLinks';

export default function ChatLog() {
  const { threadId } = useParams();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    (async () => {
      const msgs = await getThreadMessages(threadId);
      setMessages(msgs);
    })();
  }, [threadId]);

  // auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const msg = await sendMessageToThread(threadId, draft);
    setMessages(prev => [...prev, msg]);
    setDraft('');
  };

  return (
    <div className="App chat-page">
      <TopLinks />
      <h1>Chat</h1>
      <div className="chat-log">
        {messages.map(m => (
          <div key={m.id} className={m.fromMe ? 'msg me' : 'msg them'}>
            <p>{m.text}</p>
            <small>{new Date(m.sentAt).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Type a message…"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
