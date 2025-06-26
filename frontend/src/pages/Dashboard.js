import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    // Fetch feedback for employee1; adjust the username as needed.
    fetch("http://localhost:8000/feedback?username=employee1")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => setFeedbacks(data))
      .catch(error => console.error("Error fetching feedback: ", error));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Feedback Dashboard</h1>
      {feedbacks.length > 0 ? (
        <ul>
          {feedbacks.map(feedback => (
            <li key={feedback.id} style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
              <p><strong>Strengths:</strong> {feedback.strengths}</p>
              <p><strong>Areas to Improve:</strong> {feedback.areas_to_improve}</p>
              <p><strong>Sentiment:</strong> {feedback.overall_sentiment}</p>
              <p><small>Created at: {new Date(feedback.created_at).toLocaleString()}</small></p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No feedback available.</p>
      )}
    </div>
  );
}

export default Dashboard;