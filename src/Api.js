import axios from 'axios';
import TokenManager from './Context/TokenManager'; // Import the TokenManager

//local api
// const API_BASE_URL = 'http://localhost:5000';

//hosted api
const API_BASE_URL = 'https://cdd-backend-liqx.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  config => {
    const token = TokenManager.getToken(); // Get token via TokenManager
    console.log('Attaching Token:', token); // Log the token being attached
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check if error is due to token expiration
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken(); // Get refreshToken via TokenManager
        const { data } = await axios.post(`${API_BASE_URL}/token/refresh`, { refreshToken });

        TokenManager.setToken(data.accessToken); // Update token via TokenManager

        apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        // Handle refresh token errors (e.g., redirect to login)
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Define your API functions
export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post('/login', { username, password });
    const { token, user } = response.data;
    TokenManager.setToken(token); // Store token via TokenManager
    return response.data;
  } catch (error) {
    console.error('Error during loginUser:', error.message);
    throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
  }
};

export const registerUser = async (username, email, password, admin) => {
  try {
    const response = await apiClient.post('/register', { username, email, password, admin });

    // Assuming the registration response contains a token and user data
    const { token, user } = response.data;

    // Store the token if provided
    if (token) {
      TokenManager.setToken(token);
    }

    return response.data;
  } catch (error) {
    console.error('Error during registerUser:', error.message);
    throw new Error('Registration failed: ' + (error.response?.data?.error || error.message));
  }
};


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



// New function to search games based on a query
export const searchGames = async (query) => {
  try {
    const response = await apiClient.get('/api/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
};




// Function to add a game to the user's wishlist
export const addToWishlist = async (userId, gameId) => {
  try {
    const response = await apiClient.post(`/api/add-to-wishlist/${userId}/${gameId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};


// Function to retrieve a user's wishlist
export const getWishlist = async (userId) => {
  try {
    const response = await apiClient.get(`/api/mywishlist/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    throw error;
  }
};


// Function to remove a game from the user's wishlist
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


// Function to check if a user has game details
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





// Fetch collection items for a user
export const fetchCollectionItems = async (userId) => {
  try {
    const response = await apiClient.get(`/api/mycollection/${userId}`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching collection items:', error);
    throw error;
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








export const fetchGameInfo = async (game) => {
  try {
    const response = await apiClient.get(`/api/game-info/${game}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const { gameDetails } = response.data;
      return {
        success: true,
        gameDetails: {
          title: gameDetails.name,
          coverart: gameDetails.coverart,
          platform: gameDetails.console,
        },
      };
    } else {
      return { success: false, message: 'Failed to fetch game details.' };
    }
  } catch (error) {
    console.error('Error fetching game details:', error);
    return { success: false, message: 'Error fetching game details.' };
  }
};


export const addGameDetails = async (userId, game, formData) => {
  const { ownership } = formData['Game Info'];
  const { checkboxes, notes, pricePaid } = formData['Game Status'];
  const { gameCompletion, rating, review, spoilerWarning } = formData['Game Log'];

  try {
    const response = await apiClient.post(`/api/add-game-details/${userId}/${game}`, {
      userId,
      gameId: game,
      gameDetails: {
        ownership,
        included: formData['Game Info'].included,
        checkboxes: checkboxes.join(', '),
        notes,
        completion: gameCompletion,
        review,
        spoiler: spoilerWarning,
        price: parseFloat(pricePaid) || null,
        rating: parseInt(rating) || null,
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
export const fetchGameDetails = async (userId, game) => {
  try {
    const response = await apiClient.get(`/api/get-game-details/${userId}/${game}`);
    return response.data.gameDetails;
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










export const checkUsername = async (username) => {
  try {
    const response = await apiClient.get(`/api/check-username/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
  }
};

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

export const checkEmail = async (email) => {
  try {
    const response = await apiClient.get(`/api/check-email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

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