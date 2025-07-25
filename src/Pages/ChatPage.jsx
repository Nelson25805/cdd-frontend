// src/Pages/ChatPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import defaultAvatar from '../assets/default-avatar.jpg';
import {
  getUserProfile,
  getThreadMessages,
  sendMessageToThread,
  markMessagesSeen
} from '../Api';

export default function ChatPage() {
  const { user } = useUser();
  const { userId } = useParams();
  const navigate = useNavigate();

  // ─── existing state ───────────────────────────────────────
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showJump, setShowJump] = useState(false);

  const chatRef = useRef();
  const bottomRef = useRef();
  const suppressScroll = useRef(false);

  // ─── NEW: track “me” profile ───────────────────────────────
  const [meProfile, setMeProfile] = useState({
    username: user.username,
    avatar: user.avatar || ''
  });

  // ─── existing partner state ───────────────────────────────
  const [partner, setPartner] = useState({ username: '', avatar: '' });

  // 1) redirect if no userId
  useEffect(() => {
    if (!userId) navigate(-1);
  }, [userId, navigate]);

  // 2) load both profiles + threadId
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        // Partner’s profile (as before)
        const p = await getUserProfile(userId);
        setPartner({ username: p.username, avatar: p.avatar || '' });
        setThreadId(p.chatThreadId);

        // ❗❗❗ Mark everything in this thread as seen by me
        await markMessagesSeen(p.chatThreadId);

        // **Your** profile
        const me = await getUserProfile(user.userid);
        setMeProfile({ username: me.username, avatar: me.avatar || '' });
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    })();
  }, [userId, user.userid]);

  // 3) poll messages … (unchanged)
  useEffect(() => {
    if (!threadId) return;
    let stop = false;
    const loop = async () => {
      if (stop) return;
      try {
        const msgs = await getThreadMessages(threadId);
        setMessages(msgs.map(m => ({
          id: m.messageid,
          text: m.content,
          fromMe: m.senderid === user.userid,
          timestamp: new Date(m.dateadded),
          senderid: m.senderid
        })));
      } catch (err) {
        console.error(err);
      }
      setTimeout(loop, 2000);
    };
    loop();
    return () => { stop = true; };
  }, [threadId, user.userid]);

  // 4) auto-scroll only when autoScroll=true
  useEffect(() => {
    if (!autoScroll) return;
    const el = chatRef.current;
    if (!el) return;
    suppressScroll.current = true;
    el.scrollTop = el.scrollHeight;
    setShowJump(false);
  }, [messages, autoScroll]);

  // 5) onScroll handler ignores programmatic scrolls
  const onScroll = () => {
    if (suppressScroll.current) {
      suppressScroll.current = false;
      return;
    }
    const el = chatRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setAutoScroll(atBottom);
    setShowJump(!atBottom);
  };

  // 6) send message (unchanged)
  const handleSend = async e => {
    e.preventDefault();
    if (!draft.trim() || !threadId) return;
    try {
      const sent = await sendMessageToThread(threadId, draft);
      setDraft('');
      setMessages(ms => [
        ...ms,
        {
          id: sent.messageid,
          text: sent.content,
          fromMe: sent.senderid === user.userid,
          timestamp: new Date(sent.dateadded),
          senderid: sent.senderid
        }
      ]);
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  return (
    <div className="App chat-page">
      <TopLinks />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', padding: '1em 0' }}>
        <img
          src={partner.avatar || defaultAvatar}
          alt={partner.username}
          style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        <h1 style={{ margin: 0 }}>Chat with {partner.username}</h1>
      </div>

      {/* Chat log */}
      <div
        ref={chatRef}
        onScroll={onScroll}
        style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1em', position: 'relative' }}
      >
        {messages.map(m => {
          const isMe = m.fromMe;
          const name = isMe ? meProfile.username : partner.username;
          const avatar = isMe ? meProfile.avatar : partner.avatar;

          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                margin: '0.5em 0'
              }}
            >
              <img
                src={avatar || defaultAvatar}
                alt={name}
                style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 0.5em' }}
              />
              <div style={{ maxWidth: '70%' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.5em 1em',
                    borderRadius: '8px',
                    background: isMe ? '#DCF8C6' : '#EEE',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {m.text}
                </div>
                <div style={{ fontSize: '0.75em', color: '#666', marginTop: '0.25em' }}>
                  <div>{name}</div>
                  <div>{m.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />

        {showJump && (
          <button
            onClick={() => {
              const el = chatRef.current;
              if (!el) return;
              suppressScroll.current = true;
              el.scrollTop = el.scrollHeight;
              setAutoScroll(true);
              setShowJump(false);
            }}
            style={{
              position: 'sticky',
              bottom: '0.5em',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#06c',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '0.5em 1em',
              cursor: 'pointer'
            }}
          >
            Jump to latest
          </button>
        )}
      </div>

      {/* Input */}
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
