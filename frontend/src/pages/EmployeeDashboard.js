import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const employeeEmail = localStorage.getItem("employeeEmail");

  useEffect(() => {
    if (!employeeEmail) {
      navigate("/");
      return;
    }

    fetch(`http://localhost:8000/feedback?manager=all&employee=${employeeEmail}`)
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(err => console.error("Error fetching feedbacks:", err));
  }, [employeeEmail, navigate]);

  const acknowledgeFeedback = (id) => {
    fetch(`http://localhost:8000/feedback/${id}/acknowledge?username=${employeeEmail}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(() => {
        setFeedbacks((prev) =>
          prev.map((fb) =>
            fb.id === id ? { ...fb, acknowledged: true } : fb
          )
        );
      })
      .catch((err) => {
        console.error("Acknowledgment failed:", err);
        alert("Could not acknowledge feedback.");
      });
  };

  const sentimentColor = {
    positive: '#d1fae5',
    neutral: '#fef9c3',
    negative: '#fee2e2'
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeEmail");
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Welcome, Employee</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <h3 style={styles.subheading}>Your Feedback</h3>

      {feedbacks.length === 0 ? (
        <p>No feedback available yet.</p>
      ) : (
        feedbacks.map(fb => (
          <div key={fb.id} style={{
            ...styles.card,
            backgroundColor: sentimentColor[fb.overall_sentiment] || '#f9f9f9'
          }}>
            <p><strong>Date:</strong> {new Date(fb.created_at).toLocaleString("en-IN")}</p>
            <p><strong>Strengths:</strong> {fb.strengths}</p>
            <p><strong>Areas to Improve:</strong> {fb.areas_to_improve}</p>
            <p><strong>Sentiment:</strong> {fb.overall_sentiment}</p>
            {fb.acknowledged ? (
              <p style={styles.acknowledged}>✅ Acknowledged</p>
            ) : (
              <button onClick={() => acknowledgeFeedback(fb.id)} style={styles.ackButton}>
                Acknowledge
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '32px',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    alignItems: 'center'
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 600
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    color: '#fff',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500
  },
  subheading: {
    marginBottom: '16px',
    color: '#333'
  },
  card: {
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease-in-out'
  },
  ackButton: {
    marginTop: '12px',
    padding: '8px 14px',
    backgroundColor: '#6366F1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  acknowledged: {
    marginTop: '12px',
    color: 'green',
    fontWeight: 500
  }
};

export default EmployeeDashboard;