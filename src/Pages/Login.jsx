import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../Api';
import { useUser } from '../Context/UserContext';
import TokenManager from '../Context/TokenManager';
import '../App.css';

function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useUser(); 

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = await loginUser(formData.username, formData.password);
      console.log('Login successful:', userData);

      setUser(userData.user); // Update UserContext with user data
      setToken(userData.token); // Update UserContext with token

      // If a refresh token is returned, store it as well
      if (userData.refreshToken) {
        TokenManager.setRefreshToken(userData.refreshToken);
      }

      // Clear the form data
      setFormData({
        username: '',
        password: '',
      });

      navigate('/'); // Redirect to home page or any protected route
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login failure (e.g., show an error message)
    }
  };



  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="input-container">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="button-container">
          <button className="big-button" type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
