import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../Api';
import { useUser } from '../Context/useUser';
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
      const { accessToken, user } = await loginUser(formData.username, formData.password);
      console.log('Login successful:', user);

      setUser(user);                  // Update UserContext
      setToken(accessToken);          // store the 15m access token in memory via your TokenManager

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
