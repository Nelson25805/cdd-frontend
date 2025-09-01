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

  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showJump, setShowJump] = useState(false);

  const chatRef = useRef();
  const bottomRef = useRef();
  const suppressScroll = useRef(false);

  const [meProfile, setMeProfile] = useState({
    username: user.username,
    avatar: user.avatar || ''
  });
  const [partner, setPartner] = useState({ username: '', avatar: '' });

  // 1) redirect if no userId param at all
  useEffect(() => {
    if (!userId) navigate(-1);
  }, [userId, navigate]);

  // 2) load both profiles + threadId. Be tolerant: param may be other user's id or may already be a thread id.
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        // Attempt 1: treat param as other user's id and fetch their profile
        let numericParam = Number(userId);
        let p = null;
        try {
          p = await getUserProfile(userId); // if userId is actually a thread id this may fail or return no chatThreadId
        } catch (err) {
          // ignore — we'll try treating param as thread id
          p = null;
        }

        if (p && p.chatThreadId) {
          // Common case: param is other user's id and profile contains chatThreadId
          setPartner({ username: p.username, avatar: p.avatar || '' });
          setThreadId(p.chatThreadId);

          // mark seen only when we have a real numeric thread id
          if (!Number.isNaN(Number(p.chatThreadId))) {
            await markMessagesSeen(Number(p.chatThreadId));
          }
        } else {
          // Fallback: treat param as a thread id
          const tId = Number(userId);
          setThreadId(tId);

          // fetch messages to determine partner (find sender with id !== me)
          const msgs = await getThreadMessages(tId);
          // infer partner name/avatar from messages (senderName exists from your GET)
          let other = null;
          for (const m of msgs) {
            if (m.senderid !== user.userid) {
              other = { username: m.senderName || '', avatar: '' };
              break;
            }
          }
          // If we didn't find partner from messages, try to at least set a blank partner
          setPartner(prev => ({ username: other?.username || prev.username || '', avatar: other?.avatar || prev.avatar || '' }));

          // Now mark messages seen for that threadId (but only if it's a valid integer)
          if (!Number.isNaN(tId)) {
            await markMessagesSeen(tId);
          } else {
            console.warn('ChatPage: param cannot be interpreted as a thread id:', userId);
          }
        }

        // Set my own profile (useful for avatar/username)
        try {
          const me = await getUserProfile(user.userid);
          setMeProfile({ username: me.username, avatar: me.avatar || '' });
        } catch (err) {
          // ignore - we already set meProfile from context as fallback
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user.userid]);

  // 3) poll messages … (unchanged, but uses threadId reliably)
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

  // human-friendly date + time for messages
  const formatTimestamp = dt => {
    if (!dt) return '';
    const date = (dt instanceof Date) ? dt : new Date(dt);
    // detect same calendar day (local time)
    const now = new Date();
    const sameDay = date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate();

    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (sameDay) return `Today, ${time}`;

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
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
        <h1 style={{ margin: 0 }}>{}Chat with {partner.username || '(loading...)'}</h1>
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

                <div className="message-meta">
                  <div className="message-sender">{name}</div>
                  <div className="message-time">{formatTimestamp(m.timestamp)}</div>
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
