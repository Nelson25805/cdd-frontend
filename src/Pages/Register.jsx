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
  const [avatarFile, setAvatarFile] = useState(null);

  const { setUser, setToken } = useUser();
  const navigate = useNavigate();

  // Handle text input and checkbox changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle file selection for avatar
  const handleFileChange = e => {
    setAvatarFile(e.target.files[0] || null);
  };

  // Submit registration form
  const handleSubmit = async e => {
    e.preventDefault();
    const { username, password, email } = formData;
    if (!username || !password || !email) {
      alert('Please fill in all the fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Build FormData payload with file
    const payload = new FormData();
    payload.append('username', formData.username);
    payload.append('email',    formData.email);
    payload.append('password', formData.password);
    payload.append('admin',    formData.admin);
    if (avatarFile) payload.append('avatar', avatarFile);

    try {
      const { accessToken, user } = await registerUser(payload);
      TokenManager.setAccessToken(accessToken);
      setUser(user);
      setToken(accessToken);
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
      alert(err.message);
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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

        <div className="input-container checkbox-container">
          <label htmlFor="admin">Admin</label>
          <input
            type="checkbox"
            id="admin"
            name="admin"
            checked={formData.admin}
            onChange={handleChange}
          />
        </div>

        <div className="input-container">
          <label htmlFor="avatar">Avatar (optional)</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <button className="big-button" type="submit">
          Register
        </button>
      </form>

      <button className="big-button login-button" onClick={() => navigate('/login')}>
        Already have an account? Login
      </button>
    </div>
  );
};

export default Register;
