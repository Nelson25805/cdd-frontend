import { useState } from 'react';
import { searchUsers, sendFriendRequest, cancelFriendRequest } from '../Api';
import { useUser } from '../Context/useUser';
import { Link } from 'react-router-dom';
import TopLinks from '../Context/TopLinks';

export default function UserSearch() {
  const { token } = useUser();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  const doSearch = async () => {
    const users = await searchUsers(q, token);
    setResults(users);
  };

  return (
    <div>
      <TopLinks />
      <h1>Find other players</h1>
      <input value={q} onChange={e => setQ(e.target.value)} />
      <button onClick={doSearch}>Search</button>

      <ul>
        {results.map(u => (
          <li key={u.id}>
            <Link to={`/users/${u.id}`}>{u.username}</Link>
            {u.isFriend
              ? <button onClick={() => {/* maybe unfriend */}}>Unfriend</button>
              : u.requestSent
                ? <button onClick={() => cancelFriendRequest(u.id)}>Cancel</button>
                : <button onClick={() => sendFriendRequest(u.id)}>Add Friend</button>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
