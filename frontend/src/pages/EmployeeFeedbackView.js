import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EmployeeFeedbackView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee, managerEmail: stateEmail } = location.state || {};
  const storedEmail = localStorage.getItem("managerEmail");
  const managerEmail = stateEmail || storedEmail;

  const [pastFeedbacks, setPastFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    strengths: '',
    areas_to_improve: '',
    overall_sentiment: 'positive',
  });

  useEffect(() => {
    if (employee && managerEmail) {
      fetch(`http://localhost:8000/feedback?manager=${encodeURIComponent(managerEmail)}&employee=${encodeURIComponent(employee.email)}`)
        .then(res => res.json())
        .then(data => setPastFeedbacks(data))
        .catch(err => console.error("Error fetching feedbacks", err));
    }
  }, [employee, managerEmail]);

  const handleSubmit = () => {
    if (!managerEmail) {
      alert("No manager email found. Please log in as a manager.");
      return;
    }

    const url = editingFeedback
      ? `http://localhost:8000/feedback/${editingFeedback.id}?username=${managerEmail}`
      : `http://localhost:8000/feedback?username=${managerEmail}`;

    const method = editingFeedback ? 'PUT' : 'POST';
    const payload = editingFeedback
      ? formData
      : { ...formData, employee_id: employee.email };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Submission failed: ${errorText}`);
        }
        return res.json();
      })
      .then(() => {
        setFeedbackSubmitted(true);
        setFormVisible(false);
        setEditingFeedback(null);
        setFormData({ strengths: '', areas_to_improve: '', overall_sentiment: 'positive' });

        return fetch(`http://localhost:8000/feedback?manager=${managerEmail}&employee=${employee.email}`);
      })
      .then(res => res.json())
      .then(data => setPastFeedbacks(data))
      .catch(err => {
        console.error("Submission failed:", err.message);
        alert("Submission failed");
      });
  };

  const handleEdit = (fb) => {
    setEditingFeedback(fb);
    setFormVisible(true);
    setFormData({
      strengths: fb.strengths,
      areas_to_improve: fb.areas_to_improve,
      overall_sentiment: fb.overall_sentiment
    });
  };

  const sentimentColor = {
    positive: '#d1fae5',
    neutral: '#fef9c3',
    negative: '#fee2e2'
  };

  if (!employee || !managerEmail) {
    return (
      <div style={styles.page}>
        <h2>Invalid Access</h2>
        <p>Please navigate via the dashboard.</p>
        <button onClick={() => navigate('/manager')} style={styles.button}>← Back to Dashboard</button>
        <button onClick={() => {
          localStorage.removeItem("managerEmail");
          navigate("/");
        }} style={{ ...styles.button, backgroundColor: '#EF4444' }}>Logout</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button
        onClick={() => navigate('/manager', { state: { managerEmail } })}
        style={{ ...styles.button, marginBottom: '20px' }}
      >
        ← Back to Dashboard
      </button>

      <h2 style={styles.heading}>Feedback for {employee.name}</h2>
      <p><strong>Email:</strong> {employee.email}</p>

      {!formVisible && !feedbackSubmitted && (
        <button onClick={() => setFormVisible(true)} style={{ ...styles.button, marginTop: '16px' }}>
          Leave Feedback
        </button>
      )}

      {formVisible && (
        <div style={styles.formCard}>
          <h3 style={{ marginBottom: '16px' }}>{editingFeedback ? 'Edit Feedback' : 'Leave Feedback'}</h3>

          <textarea
            placeholder="Strengths"
            value={formData.strengths}
            onChange={e => setFormData({ ...formData, strengths: e.target.value })}
            style={styles.input}
          />
          <textarea
            placeholder="Areas to Improve"
            value={formData.areas_to_improve}
            onChange={e => setFormData({ ...formData, areas_to_improve: e.target.value })}
            style={styles.input}
          />
          <select
            value={formData.overall_sentiment}
            onChange={e => setFormData({ ...formData, overall_sentiment: e.target.value })}
            style={styles.dropdown}
          >
            <option value="positive">🟢 Positive</option>
            <option value="neutral">🟡 Neutral</option>
            <option value="negative">🔴 Negative</option>
          </select>

          <div style={{ marginTop: '10px' }}>
            <button onClick={handleSubmit} style={{ ...styles.button, marginRight: '10px' }}>
              {editingFeedback ? 'Update' : 'Submit'}
            </button>
            <button onClick={() => {
              setFormVisible(false);
              setEditingFeedback(null);
              setFormData({ strengths: '', areas_to_improve: '', overall_sentiment: 'positive' });
            }} style={{ ...styles.button, backgroundColor: '#9CA3AF' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <p style={{ marginTop: '16px', color: 'green' }}>✅ Feedback submitted</p>
      )}

      <div style={{ marginTop: '40px' }}>
        <h3>Past Feedback</h3>
        {pastFeedbacks.length === 0 ? (
          <p>No feedback available.</p>
        ) : (
          pastFeedbacks.map(fb => (
            <div key={fb.id} style={{
              ...styles.feedbackCard,
              backgroundColor: sentimentColor[fb.overall_sentiment] || '#fff'
            }}>
              <p><strong>Date:</strong> {new Date(fb.created_at).toLocaleString()}</p>
              <p><strong>Strengths:</strong> {fb.strengths}</p>
              <p><strong>Areas to Improve:</strong> {fb.areas_to_improve}</p>
              <p><strong>Sentiment:</strong> {fb.overall_sentiment}</p>
              <p>
                <strong>Status:</strong>{' '}
                {fb.acknowledged
                  ? <span style={{ color: 'green' }}>✅ Acknowledged</span>
                  : <span style={{ color: 'gray' }}>Not acknowledged</span>}
              </p>
              <button onClick={() => handleEdit(fb)} style={styles.viewBtn}>Edit</button>
            </div>
          ))
        )}
      </div>
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
  heading: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '12px'
  },
  button: {
    backgroundColor: '#6366F1',
    color: '#fff',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500
  },
  formCard: {
    backgroundColor: '#fff',
    padding: '24px',
    marginTop: '24px',
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
  },
  input: {
    width: '100%',
    minHeight: '60px',
    padding: '10px',
    marginBottom: '12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  dropdown: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '8px'
  },
  feedbackCard: {
    padding: '18px',
    borderRadius: '10px',
    marginBottom: '20px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
    backgroundColor: '#fff'
  },
  viewBtn: {
    marginTop: '12px',
    padding: '8px 12px',
    backgroundColor: '#6366F1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: 'pointer'
  }
};

export default EmployeeFeedbackView;