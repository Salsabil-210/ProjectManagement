import React, { useState } from 'react';
import { loginUser } from '../services/authApi';

const Home = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginUser(username, password);
      alert('Login successful!');
    } catch (err) {
      setError('Login failed! Please check your credentials.');
    }
  };

  return (
    <div style={styles.bg}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Log in</h2>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label} htmlFor="username">User Name</label>
        <input
          style={styles.input}
          id="username"
          type="text"
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <label style={{...styles.label, marginTop: 20}} htmlFor="password">Password</label>
        <input
          style={styles.input}
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <div style={styles.showPasswordRow}>
          <label style={styles.showPasswordLabel}>
            Show Password
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              style={styles.checkbox}
            />
          </label>
        </div>
        <button type="submit" style={styles.submit}>SUBMIT</button>
      </form>
    </div>
  );
};

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#3a3847',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#23222a',
    borderRadius: 15,
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.3)',
    padding: '40px 40px 30px 40px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 350,
    maxWidth: 350,
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 600,
    fontSize: 32,
    letterSpacing: 1,
  },
  error: {
    color: '#ff5252',
    background: '#2d1a1a',
    borderRadius: 6,
    padding: '8px 0',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  label: {
    color: '#1de9f6',
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 2,
    fontWeight: 400,
  },
  input: {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #888',
    color: '#fff',
    fontSize: 16,
    padding: '8px 0',
    marginBottom: 8,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  showPasswordRow: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0 20px 0',
  },
  showPasswordLabel: {
    color: '#fff',
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    marginLeft: 8,
    width: 16,
    height: 16,
  },
  submit: {
    marginTop: 10,
    background: 'none',
    color: '#1de9f6',
    border: 'none',
    fontSize: 16,
    letterSpacing: 5,
    cursor: 'pointer',
    alignSelf: 'flex-end',
    transition: 'color 0.2s',
  },
};

export default Home;