import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(password);
      navigate('/');
    } catch (err) {
      if (err.message === 'Network Error') {
        setError('Cannot connect to the backend server. Is it running?');
      } else if (err.response && err.response.status === 401) {
        setError('Invalid password. Please try again.');
      } else {
        setError('An unexpected error occurred: ' + err.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1>🏥 Clinic Checklist</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter clinic password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-block">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
