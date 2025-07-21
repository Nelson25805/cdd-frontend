import { useState } from 'react';
import {
  searchUsers,
  sendFriendRequest,
  cancelFriendRequest,
  unfriend
} from '../Api';
import { Link } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';

export default function UserSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  const doSearch = async () => {
    try {
      const users = await searchUsers(q);
      setResults(users);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSendRequest = async id => {
    try {
      await sendFriendRequest(id);
      setResults(rs =>
        rs.map(u => (u.id === id ? { ...u, requestSent: true } : u))
      );
    } catch (err) {
      console.error('Failed to send request:', err);
    }
  };

  const handleCancelRequest = async id => {
    try {
      await cancelFriendRequest(id);
      setResults(rs =>
        rs.map(u => (u.id === id ? { ...u, requestSent: false } : u))
      );
    } catch (err) {
      console.error('Failed to cancel request:', err);
    }
  };

  return (
    <div>
      <TopLinks />
      <h1>Find other players</h1>
      <input
        placeholder="Username…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <button onClick={doSearch}>Search</button>

      <ul>
        {results.map(u => (
          <li key={u.id}>
            <Link to={`/users/${u.id}`}>{u.username}</Link>{' '}
            {u.isFriend ? (
              <button
                onClick={async () => {
                  await unfriend(u.id);
                  doSearch();
                }}
              >
                Unfriend
              </button>
            ) : u.requestSent ? (
              <button onClick={() => handleCancelRequest(u.id)}>
                Cancel Request
              </button>
            ) : (
              <button onClick={() => handleSendRequest(u.id)}>
                Add Friend
              </button>
            )}
          </li>

        ))}
      </ul>
    </div>
  );
}
