import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await res.json();

      if (data.role === 'manager') {
        localStorage.setItem('managerEmail', data.email);
        navigate('/manager');
      } else if (data.role === 'employee') {
        localStorage.setItem('employeeEmail', data.email);
        navigate('/employee');
      }
    } catch (err) {
      console.error('Login failed:', err.message);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.heading}>Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
            required
          />
        </div>

        <div style={{ ...styles.inputGroup, position: 'relative' }}>
          <label style={styles.label}>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ ...styles.input, paddingRight: '40px' }}
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            style={styles.eye}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit" style={styles.button}>Continue</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #eef2f3, #d4d9dd)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '36px',
    borderRadius: '12px',
    boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px'
  },
  heading: {
    fontSize: '1.8rem',
    fontWeight: 600,
    marginBottom: '24px',
    textAlign: 'center',
    color: '#333'
  },
  inputGroup: {
    marginBottom: '18px'
  },
  label: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '6px',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    backgroundColor: '#fafafa'
  },
  eye: {
    position: 'absolute',
    top: '65%',
    right: '12px',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#777',
    lineHeight: 0, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'

  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: '8px',
    backgroundColor: '#4F46E5',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  error: {
    backgroundColor: '#ffe0e0',
    color: '#b00020',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '18px',
    textAlign: 'center',
    fontSize: '14px'
  }
};

export default Login;