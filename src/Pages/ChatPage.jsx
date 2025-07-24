import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/useUser';
import defaultAvatar from '../assets/default-avatar.jpg';
import {
  getUserProfile,
  getThreadMessages,
  sendMessageToThread
} from '../Api';

export default function ChatPage() {
  const { user }   = useUser();
  const { userId } = useParams();
  const navigate   = useNavigate();

  const [threadId,   setThreadId]   = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [draft,      setDraft]      = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showJump,   setShowJump]   = useState(false);

  const chatRef   = useRef();
  const bottomRef = useRef();
  // suppressScroll lets us ignore one onScroll after we scroll programmatically
  const suppressScroll = useRef(false);

  // Partner’s profile + threadId
  const [partner, setPartner] = useState({ username: '', avatar: '' });
  useEffect(() => {
    if (!userId) return navigate(-1);
    (async () => {
      const p = await getUserProfile(userId);
      setPartner({ username: p.username, avatar: p.avatar || '' });
      setThreadId(p.chatThreadId);
    })();
  }, [userId, navigate]);

  // Poll messages
  useEffect(() => {
    if (!threadId) return;
    let stop = false;
    const loop = async () => {
      if (stop) return;
      try {
        const msgs = await getThreadMessages(threadId);
        setMessages(msgs.map(m => ({
          id:        m.messageid,
          text:      m.content,
          fromMe:    m.senderid === user.userid,
          timestamp: new Date(m.dateadded),
          senderid:  m.senderid
        })));
      } catch (err) {
        console.error(err);
      }
      setTimeout(loop, 2000);
    };
    loop();
    return () => { stop = true; };
  }, [threadId, user.userid]);

  // When messages update and autoScroll=true, jump to bottom silently
  useEffect(() => {
    if (!autoScroll) return;
    const el = chatRef.current;
    if (!el) return;
    suppressScroll.current = true;
    el.scrollTop = el.scrollHeight;
    // hide the jump button
    setShowJump(false);
  }, [messages, autoScroll]);

  // Handle user scrolls
  const onScroll = () => {
    if (suppressScroll.current) {
      // this was our own scroll; ignore it
      suppressScroll.current = false;
      return;
    }
    const el = chatRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    setAutoScroll(atBottom);
    setShowJump(!atBottom);
  };

  // Send
  const handleSend = async e => {
    e.preventDefault();
    if (!draft.trim() || !threadId) return;
    const sent = await sendMessageToThread(threadId, draft);
    setDraft('');
    setMessages(ms => [
      ...ms,
      {
        id:        sent.messageid,
        text:      sent.content,
        fromMe:    sent.senderid === user.userid,
        timestamp: new Date(sent.dateadded),
        senderid:  sent.senderid
      }
    ]);
  };

  return (
    <div className="App chat-page">
      <TopLinks />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'1em', padding:'1em 0' }}>
        <img
          src={partner.avatar || defaultAvatar}
          alt={partner.username}
          style={{ width:40, height:40, borderRadius:'50%' }}
        />
        <h1 style={{ margin:0 }}>Chat with {partner.username}</h1>
      </div>

      {/* Chat log */}
      <div
        ref={chatRef}
        onScroll={onScroll}
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '1em',
          position: 'relative'
        }}
      >
        {messages.map(m => {
          const isMe = m.fromMe;
          const name = isMe ? user.username : partner.username;
          const avatar = isMe ? user.avatar : partner.avatar;

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
                src={avatar||defaultAvatar}
                alt={name}
                style={{ width:32, height:32, borderRadius:'50%', margin:'0 0.5em' }}
              />
              <div style={{ maxWidth:'70%' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.5em 1em',
                    borderRadius: '8px',
                    background: isMe ? '#DCF8C6' : '#EEE',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                  }}
                >
                  {m.text}
                </div>
                <div style={{ fontSize:'0.75em', color:'#666', marginTop:'0.25em' }}>
                  <div>{name}</div>
                  <div>{m.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* sentinel */}
        <div ref={bottomRef} />

        {/* Jump button */}
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
              background:'#06c',
              color:'white',
              border:'none',
              borderRadius:'16px',
              padding:'0.5em 1em',
              cursor:'pointer'
            }}
          >
            Jump to latest
          </button>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display:'flex', padding:'1em' }}>
        <input
          type="text"
          value={draft}
          onChange={e=>setDraft(e.target.value)}
          placeholder="Type a message…"
          style={{ flex:1, padding:'0.5em' }}
        />
        <button type="submit" style={{ marginLeft:'0.5em', padding:'0.5em 1em' }}>
          Send
        </button>
      </form>
    </div>
  );
}
