// TokenManager.jsx
import apiClient from '../Api';

class TokenManager {
  // in-memory storage for access token
  static accessToken = null;

  /**
   * Alias for getAccessToken (for older components using getToken)
   */
  static getToken() {
    return this.getAccessToken();
  }

  static setToken(token) {
    this.setAccessToken(token);
  }

  /**
   * Get the current access token
   */
  static getAccessToken() {
    return this.accessToken;
  }

  /**
   * Store a new access token in-memory
   */
  static setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Refreshes the access token by calling the backend refresh endpoint.
   * The HttpOnly refresh cookie is sent automatically via apiClient.
   * Returns the new access token.
   */
  static async refreshAccessToken() {
    try {
      const response = await apiClient.post('/api/token/refresh');
      const { accessToken } = response.data;
      this.setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }
}

export default TokenManager;
