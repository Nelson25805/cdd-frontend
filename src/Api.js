import axios from 'axios';
import TokenManager from './Context/TokenManager';

// base URL
//const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = 'https://cdd-backend-liqx.onrender.com';

// create axios instance with credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// attach access token to headers
apiClient.interceptors.request.use(
  config => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// response interceptor for auto-refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // if we're already trying to refresh, just fail
    if (originalRequest.url?.endsWith('/api/token/refresh')) {
      return Promise.reject(error);
    }

    // on 401, try one retry with a fresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // call refresh endpoint; cookie is sent automatically
        const refreshRes = await apiClient.post('/api/token/refresh');
        const { accessToken } = refreshRes.data;

        // update in-memory token
        TokenManager.setAccessToken(accessToken);
        // update default header for future requests
        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;

        // retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);

        // clear client state & send user back to login
        TokenManager.setAccessToken(null);
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


/** Login user */
export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post('/login', { username, password });
    const { accessToken, user } = response.data;

    TokenManager.setAccessToken(accessToken);
    return { accessToken, user };
  } catch (error) {
    console.error('Error during loginUser:', error);
    throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
  }
};

/** Register user */
export const registerUser = async (username, email, password, admin) => {
  try {
    const response = await apiClient.post('/register', { username, email, password, admin });
    const { accessToken, user } = response.data;

    if (accessToken) {
      TokenManager.setAccessToken(accessToken);
    }
    return { accessToken, user };
  } catch (error) {
    console.error('Error during registerUser:', error);
    throw new Error('Registration failed: ' + (error.response?.data?.error || error.message));
  }
};

/** Adds a game to cdd game database */
export const addGameToDatabase = async (formData) => {
  try {
    const response = await apiClient.post('/add-game-to-database', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding game to database:', error.message);
    throw new Error('Failed to add game to database');
  }
};


/** Search games from cdd game database */
export const searchGames = async (query) => {
  const response = await apiClient.get('/api/search', { params: { q: query } });
  // if the server wrapped it, pull out .results; otherwise assume it's already an array
  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};

/** Checks wishlist games */
export const checkWishlist = async (userId, gameId) => {
  try {
    const response = await apiClient.get(
      `/api/check-wishlist/${userId}/${gameId}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;   // { hasWishlist: boolean }
  } catch (err) {
    console.error('Error checking wishlist:', err);
    throw err;
  }
};

/** Adds game to user wishlist */
export const addToWishlist = async (userId, gameId, consoleIds) => {
  const response = await apiClient.post(
    `/api/add-game-wishlist/${userId}/${gameId}`,
    { consoleIds }
  );
  return response.data;
};


/** Grabs wishlist game details user games for game */
export const fetchWishlistDetails = async (userId, gameId) => {
  try {
    const response = await apiClient.get(
      `/api/get-wishlist-details/${userId}/${gameId}`
    );
    // server should respond with { consoles: [ { consoleid, name }, … ] }
    return response.data;
  } catch (err) {
    console.error("Error in fetchWishlistDetails:", err.response?.data || err);
    throw err;
  }
};

/** Edits wishlist details for user game in wishlist */
export const editWishlistDetails = async (userId, gameId, { consoleIds }) => {
  const res = await apiClient.put(
    `/api/edit-wishlist/${userId}/${gameId}`,
    { consoleIds },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { success: res.status === 200 };
};


/** Checks for game details in a users game details section */
export const checkGameDetails = async (userId, gameId) => {
  try {
    const response = await apiClient.get(`/api/check-gamedetails/${userId}/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error checking game details:', error);
    throw error;
  }
};


// Function to view game details
export const getGameDetails = async (gameId) => {
  try {
    const response = await apiClient.get(`/api/game-details/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error retrieving game details:', error);
    throw error;
  }
};


/**
 * Add a game to the user's collection on specific consoles.
 */
export const addToCollection = async (userId, gameId, consoleIds) => {
  try {
    const response = await apiClient.post(
      `/api/add-to-collection/${userId}/${gameId}`,
      { consoleIds },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to collection:', error);
    throw error;
  }
};


export const fetchGameInfo = async (gameId) => {
  try {
    const { data, status } = await apiClient.get(`/api/game-info/${gameId}`);
    if (status !== 200) {
      return { success: false, message: 'Failed to fetch game details.' };
    }
    const { gameDetails } = data;
    return {
      success: true,
      gameDetails: {
        title: gameDetails.name,
        coverart: gameDetails.coverart,
        consoles: gameDetails.consoles,   // ← array of { consoleid, name }
      },
    };
  } catch (err) {
    console.error('Error fetching game details:', err);
    return { success: false, message: 'Error fetching game details.' };
  }
};

// adds game details to inserted game
export const addGameDetails = async (userId, gameId, details) => {
  try {
    const response = await apiClient.post(
      `/api/add-game-details/${userId}/${gameId}`,
      details,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.status === 200) {
      return { success: true, message: 'Game details added successfully!' };
    } else {
      return { success: false, message: 'Failed to add game details.' };
    }
  } catch (error) {
    console.error('Error adding game details:', error);
    return { success: false, message: 'Error adding game details.' };
  }
};



// Fetch detailed game information
export const fetchGameDetails = async (userId, gameId) => {
  try {
    const response = await apiClient.get(`/api/get-game-details/${userId}/${gameId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed game info:', error);
    throw error;
  }
};



// Edit game details
export const editGameDetails = async (userId, game, details) => {
  try {
    const response = await apiClient.put(`/api/edit-game-details/${userId}/${game}`, details, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error editing game details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// checks for valid username
export const checkUsername = async (username) => {
  try {
    const response = await apiClient.get(`/api/check-username/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
  }
};

// updates username requested by user
export const updateUsername = async (userId, newUsername) => {
  try {
    const response = await apiClient.put(`/api/update-username/${userId}`, {
      newUsername
    });
    return response.data;
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

// updates password requested by user
export const updatePassword = async (userId, newPassword) => {
  try {
    const response = await apiClient.put(`/api/update-password/${userId}`, {
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// checks email
export const checkEmail = async (email) => {
  try {
    const response = await apiClient.get(`/api/check-email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

// updates email address for the user
export const updateEmail = async (userId, newEmail) => {
  try {
    const response = await apiClient.put(`/api/update-email/${userId}`, {
      newEmail
    });
    return response.data;
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

// upload a new avatar
export const updateAvatar = async (formData) => {
  const res = await apiClient.post('/api/users/avatar', formData);
  return res.data; // { avatar: '<publicUrl>' }
};

// remove current avatar
export const removeAvatar = async () => {
  const res = await apiClient.delete('/api/users/avatar');
  return res.data; // { avatar: null }
};


// fetches report data for user that is requested
export const fetchReportData = async (reportType) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/api/reports/${reportType}`);
    if (response.headers['content-type'].includes('application/json')) {
      return response.data;
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    return null;
  }
};


//
// ───────────── USER SEARCH & FRIEND REQUESTS ─────────────
//

/**
 * Find users by username (partial match).
 * Returns an array of { id, username, isFriend, requestSent }.
 */
export const searchUsers = async (query) => {
  const res = await apiClient.get('/api/users/search', { params: { q: query } });
  return res.data;
};

/** Send a friend request to userId */
export const sendFriendRequest = async (targetUserId) => {
  const res = await apiClient.post(`/api/friends/request/${targetUserId}`);
  return res.data;
};

/** Cancel a pending friend request to userId */
export const cancelFriendRequest = async (targetUserId) => {
  const res = await apiClient.delete(`/api/friends/request/${targetUserId}`);
  return res.data;
};

/** Unfriend an existing friend */
export const unfriend = async (targetUserId) => {
  const res = await apiClient.delete(`/api/friends/${targetUserId}`);
  return res.data;
};

/** Decline (delete) an incoming friend request */
export const declineFriendRequest = async (requesterId) => {
  const res = await apiClient.delete(
    `/api/friends/requests/incoming/${requesterId}`
  );
  return res.data;
};

//
// ───────────── USER PROFILE & COLLECTION/WISHLIST ─────────────
//

/** Get a user’s public profile (avatar, bio, isFriend, chatThreadId) */
export const getUserProfile = async (userId) => {
  const res = await apiClient.get(`/api/users/${userId}/profile`);
  return res.data;
};


//
// ───────────── MESSAGING ─────────────
//

/** Fetch messages in a given thread */
export const getMessages = async (threadId) => {
  const res = await apiClient.get(`/api/threads/${threadId}/messages`);
  return res.data;  // [{ id, senderId, senderName, text, timestamp }, …]
};

/**
 * Send a new message in a thread.
 * Returns the new message object.
 */
export const sendMessage = async (threadId, text) => {
  const res = await apiClient.post(
    `/api/threads/${threadId}/messages`,
    { text }
  );
  return res.data;
};

// Fetch pending requests for the logged‑in user
export const getIncomingFriendRequests = async () => {
  const res = await apiClient.get('/api/friends/requests/incoming');
  return res.data; // [{ requesterId, username, avatar, sentAt }, …]
};

// Accept an incoming request
export const acceptFriendRequest = async (requesterId) => {
  const res = await apiClient.post(`/api/friends/accept/${requesterId}`);
  return res.data;
};

/** Get your current friends + thread IDs */
export const getFriends = async () => {
  const res = await apiClient.get('/api/friends');
  return res.data; // [{ id, username, avatar, threadId }, …]
};

/** Fetch pending incoming requests _to_ a user */
export const getUserIncomingRequests = async (userId) => {
  const res = await apiClient.get(`/api/users/${userId}/requests/incoming`);
  return res.data; // [{ id, username, avatar, sentAt }, …]
};

/** Fetch pending outgoing requests _from_ a user */
export const getUserOutgoingRequests = async (userId) => {
  const res = await apiClient.get(`/api/users/${userId}/requests/outgoing`);
  return res.data; // [{ id, username, avatar, sentAt }, …]
};

/** Fetch accepted friends for a user */
export const getUserFriends = async (userId) => {
  const res = await apiClient.get(`/api/users/${userId}/friends`);
  return res.data; // [{ id, username, avatar, friendedAt }, …]
};

/** Fetch User thread messages */
export async function getUserThreads() {
  const res = await apiClient.get('/api/threads');
  return res.data;
}

/** Fetch thread messages from friend */
export async function getThreadMessages(threadId) {
  const res = await apiClient.get(`/api/threads/${threadId}/messages`);
  return res.data;
}

/** Send message to thread */
export async function sendMessageToThread(threadId, text) {
  const res = await apiClient.post(
    `/api/threads/${threadId}/messages`,
    { text }
  );
  return res.data;
}

/** Mark message as seen for user */
export const markMessagesSeen = async (threadId) => {
  const res = await apiClient.post(`/api/threads/${threadId}/mark-seen`);
  return res.data;
};









//I WANT TO KEEP

// Fetch the *current logged-in user's* collection
export const getMyCollection = async () => {
  try {
    const res = await apiClient.get('/api/mycollection'); // server uses req.user.userid
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  } catch (err) {
    console.error('Error fetching my collection:', err);
    throw err;
  }
};

/** Get another user’s collection of games */
export const getUserCollection = async (identifier) => {
  if (!identifier) throw new Error('getUserCollection requires an identifier');
  try {
    const res = await apiClient.get(`/api/users/${encodeURIComponent(identifier)}/collection`);
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  } catch (err) {
    console.error('Error fetching user collection:', err);
    throw err;
  }
};

// Remove a game from the collection
export const removeGameFromCollection = async (userId, gameId) => {
  try {
    const response = await apiClient.delete(`/api/removecollection/${userId}/${gameId}`);
    console.log('This is the response: ', response);
    return response;
  } catch (error) {
    console.error('Error removing game:', error);
    throw error;
  }
};



// Fetch the *current logged-in user's* wishlist
export const getMyWishlist = async () => {
  try {
    const res = await apiClient.get('/api/mywishlist');
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  } catch (err) {
    console.error('Error fetching my wishlist:', err);
    throw err;
  }
};

// Fetch another user's wishlist by identifier
export const getUserWishlist = async (identifier) => {
  if (!identifier) throw new Error('getUserWishlist requires an identifier');
  try {
    const res = await apiClient.get(`/api/users/${encodeURIComponent(identifier)}/wishlist`);
    return Array.isArray(res.data) ? res.data : (res.data.results ?? []);
  } catch (err) {
    console.error('Error fetching user wishlist:', err);
    throw err;
  }
};

/** Removes game from user game wishlist */
export const removeFromWishlist = async (userId, gameId) => {
  try {
    const response = await apiClient.delete(`/api/removewishlist/${userId}/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};