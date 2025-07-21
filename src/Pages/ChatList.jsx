import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserThreads } from '../Api'; // you’ll need to implement this
import TopLinks from '../Context/TopLinks';

export default function ChatList() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    (async () => {
      const list = await getUserThreads(); 
      // returns [{ id: threadId, otherUser: { id, username, avatar } }]
      setThreads(list);
    })();
  }, []);

  if (!threads.length) return <div>No conversations yet.</div>;

  return (
    <div className="App">
      <TopLinks />
      <h1>Your Conversations</h1>
      <ul>
        {threads.map(t => (
          <li key={t.id}>
            <img
              src={t.otherUser.avatar || defaultAvatar}
              className="tiny-avatar"
              alt={t.otherUser.username}
            />
            {t.otherUser.username}
            <button
              className="tiny-button"
              onClick={() => navigate(`/messages/${t.id}`)}
            >
              Open
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
