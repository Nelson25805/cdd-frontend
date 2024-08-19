// TokenManager.jsx
class TokenManager {
    static getToken() {
      return localStorage.getItem('token');
    }
  
    static setToken(token) {
      localStorage.setItem('token', token);
    }
  
    static getRefreshToken() {
      return localStorage.getItem('refreshToken');
    }
  
    static setRefreshToken(refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    static async refreshAuthToken() {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');
  
        const response = await axios.post(`${API_BASE_URL}/api/refresh-token`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
  
        const newToken = response.data.token;
        this.setToken(newToken);
        return newToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
  }
  
  export default TokenManager;
  