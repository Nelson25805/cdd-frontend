import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../Api';
import { useUser } from '../Context/useUser';
import TokenManager from '../Context/TokenManager';
import '../App.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    admin: false,
  });
  const { setUser, setToken } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? e.target.checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.username || !formData.password || !formData.email) {
      alert('Please fill in all the fields.');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    try {
      const userData = await registerUser(
        formData.username,
        formData.email,
        formData.password,
        formData.admin
      );
  
      // Store user and token in context
      setUser(userData.user);
      setToken(userData.token);

      console.log('User Data before token manager:', userData);
  
      // If a refresh token is returned, store it as well
      if (userData.refreshToken) {
        TokenManager.setRefreshToken(userData.refreshToken);
      }

      console.log('User Data after token manager:', userData);

  
      navigate('/'); // Redirect to home or another protected route after successful registration
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed: ' + error.message);
    }
  };
  

  return (
    <div>
      <h2>Register</h2>
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
        <div className="input-container">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="input-container">
          <label htmlFor="admin">Admin</label>
          <input
            type="checkbox"
            id="admin"
            name="admin"
            checked={formData.admin}
            onChange={handleChange}
          />
        </div>
        <button className="big-button" type="submit">
          Register
        </button>
      </form>
      <button className="big-button" onClick={() => navigate('/login')}>
        Login
      </button>
    </div>
  );
};

export default Register;
