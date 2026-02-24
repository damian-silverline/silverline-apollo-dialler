import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import DialerUI from './components/DialerUI';
import jwt_decode from 'jwt-decode';

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    console.log('Loaded from localStorage:', { storedUser, storedToken });
    if (storedUser && storedToken) {
      try {
        // Only decode if token looks like a JWT (contains two dots)
        if (storedToken.split('.').length === 3) {
          const decoded = jwt_decode(storedToken);
          console.log('Decoded token:', decoded);
          if (decoded.exp * 1000 > Date.now()) {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedToken);
          } else {
            console.log('Token expired, clearing localStorage');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
        } else {
          // Not a JWT, just trust the token is valid
          setUser(JSON.parse(storedUser));
          setAccessToken(storedToken);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', token);
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DialerUI user={user} accessToken={accessToken} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
