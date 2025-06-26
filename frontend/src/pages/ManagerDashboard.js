import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const stateEmail = routerLocation.state?.email;
  const storedEmail = localStorage.getItem('managerEmail');
  const email = stateEmail || storedEmail;

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (!email) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:8000/team?username=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(async (data) => {
  const enriched = await Promise.all(data.map(async (emp) => {
    const sentiment = await fetchSentimentCounts(email, emp.email);
    return { ...emp, sentiment };
  }));
  console.log("Enriched team members:", enriched);
  setEmployees(enriched);
  })
    .catch(err => console.error('❌ Failed to load team', err));
  }, [email, navigate]);

  const fetchSentimentCounts = async (managerEmail, employeeEmail) => {
  const res = await fetch(`http://localhost:8000/feedback?manager=${managerEmail}&employee=${employeeEmail}`);
  const data = await res.json();

  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0
  };

  data.forEach(fb => {
    counts[fb.overall_sentiment] = (counts[fb.overall_sentiment] || 0) + 1;
  });

  return counts;
};

  const handleSelectEmployee = (employee) => {
    navigate('/employee-feedback', {
      state: {
        employee,
        managerEmail: email
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('managerEmail');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manager Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <p style={styles.intro}>Welcome! Here’s your team overview. Click on a member to view or leave feedback.</p>

      <div style={styles.cardGrid}>
        {employees.map((emp) => (
          <div key={emp.email} style={styles.card}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random&rounded=true&size=80`}
              alt="avatar"
              style={styles.avatar}
            />
            <div style={styles.name}>{emp.name}
              <div style={{ marginTop: '12px', fontSize: '14px' }}>
  <span style={{ color: 'green', marginRight: '8px' }}>🟢 {emp.sentiment?.positive || 0}</span>
  <span style={{ color: '#d97706', marginRight: '8px' }}>🟡 {emp.sentiment?.neutral || 0}</span>
  <span style={{ color: '#dc2626' }}>🔴 {emp.sentiment?.negative || 0}</span>
</div>
            </div>
            <div style={styles.email}>{emp.email}</div>
            <button onClick={() => handleSelectEmployee(emp)} style={styles.viewBtn}>
              View Feedback
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#f2f4f8',
    minHeight: '100vh',
    padding: '40px 30px',
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 600,
    margin: 0,
    color: '#333'
  },
  logoutBtn: {
    padding: '10px 18px',
    backgroundColor: '#EF4444',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  intro: {
    fontSize: '15px',
    color: '#555',
    marginBottom: '24px'
  },
  cardGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  },
  card: {
    width: '230px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
    textAlign: 'center',
    cursor: 'pointer'
  },
  cardHover: {
    transform: 'scale(1.03)'
  },
  avatar: {
    width: '80px',
    borderRadius: '50%',
    marginBottom: '12px'
  },
  name: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: '4px'
  },
  email: {
    fontSize: '0.85rem',
    color: '#777'
  },
  viewBtn: {
    marginTop: '14px',
    padding: '8px 12px',
    backgroundColor: '#6366F1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer'
  }
};

export default ManagerDashboard;