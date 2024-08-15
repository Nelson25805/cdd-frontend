import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Replace with your backend URL


export const loginUser = async (username, password) => {
  console.log('loginUser called with:', { username, password });
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
    const {token, user} = response.data;
    console.log('Token:', token, 'User: ', user);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error('Login failed: ' + error.response.data.message);
    } else {
      console.error('Error during loginUser:', error.message);
      throw new Error('Login failed: ' + error.message);
    }
  }
};

export const registerUser = async (username, email, password, admin) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { username, email, password, admin });
    console.log('Response status:', response.status);

    if (response.status === 201) {
      console.log('Registration successful');
      return response.data; // Assuming response.data contains user data and token
    } else {
      const errorText = response.data.error || 'Unknown error occurred';
      console.error('Error response:', errorText);
      throw new Error('Registration failed: ' + errorText);
    }
  } catch (error) {
    console.error('Error during registerUser:', error.message);
    throw new Error('Registration failed: ' + error.message);
  }
};

export const addGameToDatabase = async (formData, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add-game-to-database`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};



// New function to search games based on a query
export const searchGames = async (query, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/search`, {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
};


// Function to add a game to the user's wishlist
export const addToWishlist = async (userId, gameId, token) => {
  console.log('Api stuff: ');
  console.log('UserId: ', userId);
  console.log('GameId: ', gameId);
  console.log('Token: ', token);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/add-to-wishlist/${userId}/${gameId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Function to retrieve a user's wishlist
export const getWishlist = async (userId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/mywishlist/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    throw error;
  }
};

// Function to remove a game from the user's wishlist
export const removeFromWishlist = async (userId, gameId, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/removewishlist/${userId}/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};







// Function to check if a user has game details
export const checkGameDetails = async (userId, gameId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/check-gamedetails/${userId}/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error checking game details:', error);
    throw error;
  }
};

// Function to view game details
export const getGameDetails = async (gameId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/game-details/${gameId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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
    const response = await axios.get(`${API_BASE_URL}/api/mycollection/${userId}`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching collection items:', error);
    throw error;
  }
};

// Remove a game from the collection
export const removeGameFromCollection = async (userId, gameId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/removecollection/${userId}/${gameId}`);
    console.log('This is the response: ', response);
    return response;
  } catch (error) {
    console.error('Error removing game:', error);
    throw error;
  }
};







export const fetchGameInfo = async (game, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/game-info/${game}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

export const addGameDetails = async (userId, game, formData, token) => {
  const { ownership } = formData['Game Info'];
  const { checkboxes, notes, pricePaid } = formData['Game Status'];
  const { gameCompletion, rating, review, spoilerWarning } = formData['Game Log'];

  try {
    const response = await axios.post(`${API_BASE_URL}/api/add-game-details/${userId}/${game}`, {
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
        Authorization: `Bearer ${token}`,
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
      const response = await axios.get(`${API_BASE_URL}/api/get-game-details/${userId}/${game}`);
      return response.data.gameDetails;
  } catch (error) {
      console.error('Error fetching detailed game info:', error);
      throw error;
  }
};

// Edit game details
export const editGameDetails = async (userId, game, details) => {
  try {
      // Send PUT request to update game details
      const response = await axios.put(`${API_BASE_URL}/api/edit-game-details/${userId}/${game}`, details, {
          headers: {
              'Content-Type': 'application/json',
          },
      });

      // Return only the response data
      return response.data;
  } catch (error) {
      // Log detailed error information
      console.error('Error editing game details:', error.response ? error.response.data : error.message);

      // Re-throw error to be handled by the calling function
      throw error;
  }
};









// Function to check if the username exists
export const checkUsername = async (username) => {
  const response = await axios.get(`${API_BASE_URL}/api/check-username/${username}`);
  return response.data;
};

export const updateUsername = async (userId, newUsername) => {
  console.log('Updating username for userId:', userId); // Check userId
  const response = await axios.put(`${API_BASE_URL}/api/update-username/${userId}`, {
      newUsername
  });
  return response.data;
};


// Function to update the password
export const updatePassword = async (userId, newPassword) => {
  const response = await axios.put(`${API_BASE_URL}/api/update-password/${userId}`, {
      newPassword
  });
  return response.data;
};

// Function to check if the email exists
export const checkEmail = async (email) => {
  const response = await axios.get(`${API_BASE_URL}/api/check-email/${email}`);
  return response.data;
};

// Function to update the email
export const updateEmail = async (userId, newEmail) => {
  const response = await axios.put(`${API_BASE_URL}/api/update-email/${userId}`, {
      newEmail
  });
  return response.data;
};
















export const fetchReportData = async (reportType) => {
  try {
      const response = await axios.get(`${API_BASE_URL}/api/reports/${reportType}`);
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