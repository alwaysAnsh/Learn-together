import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../redux/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  return (
  <div className="login-container">
    <div className="login-layout">
      
      {/* Left Illustration Panel */}
      <div className="login-visual">
        <div className="visual-content">
          <h2>Welcome Back 👋</h2>
          <p>
            Assign tasks, collaborate with friends,  
            and study smarter together.
          </p>

          <ul>
            <li>✔ Task-based learning</li>
            <li>✔ Team collaboration</li>
            <li>✔ Simple & fast workflow</li>
          </ul>
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="brand-strip"></div>

        <div className="login-header">
          <h1>Task Assignment</h1>
          <p>Practice & Study Together</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-info">
          <p><strong>Demo Credentials</strong></p>
          <p>User 1: <code>Ansh</code> / <code>password123</code></p>
          <p>User 2: <code>Harshita</code> / <code>password123</code></p>
        </div>
        <Link to={'/'}>
        <div className="back-dashboard">
          <span className="back-circle">←</span>
          <span className="back-text">Back to Home</span>
        </div>
        </Link>

      </div>
    </div>
  </div>
);

};

export default Login;