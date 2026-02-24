import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we're returning from Google OAuth callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userJson = params.get('user');
    const callbackError = params.get('error');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        // Always store both user and token in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', token);
        onLoginSuccess(user, token);
        // Clean up URL (always set to root)
        window.history.replaceState({}, document.title, '/');
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Failed to parse user data');
      }
    } else if (callbackError) {
      setError(callbackError);
      window.history.replaceState({}, document.title, '/');
    }
  }, [onLoginSuccess]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the auth URL from backend
      const urlResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/google/url`);
      const authUrl = urlResponse.data.url; // Use the correct property name

      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      setError('Failed to initiate Google login');
      console.error('Error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Silverline Apollo Dialer</h1>
        <p>Professional Lead Management & Calling Platform</p>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-message">Redirecting to Google...</div>
        ) : (
          <button
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Login with Google
          </button>
        )}
        
        <p className="terms-text">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default Login;
