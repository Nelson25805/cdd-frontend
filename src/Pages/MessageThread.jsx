// src/Pages/MessageThread.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../Api';
import TopLinks from '../Context/TopLinks';

export default function MessageThread() {
  const { thread } = useParams();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft]     = useState('');

  // Poll for new messages every 2 seconds
  useEffect(() => {
    let id = setInterval(async () => {
      try {
        const msgs = await getMessages(thread);
        setMessages(msgs);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [thread]);

  const onSend = async () => {
    if (!draft.trim()) return;
    try {
      await sendMessage(thread, draft);
      setDraft('');
      // fetch immediately after send
      const msgs = await getMessages(thread);
      setMessages(msgs);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="App">
      <TopLinks />
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
    </div>
  );
}
