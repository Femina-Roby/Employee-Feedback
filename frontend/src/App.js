import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeFeedbackView from './pages/EmployeeFeedbackView';

<Route path="/employee-feedback" element={<EmployeeFeedbackView />} />
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee-feedback" element={<EmployeeFeedbackView />} />
      </Routes>
    </Router>
  );  
}

export default App;