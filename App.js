import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navigation from './components/Navigation';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  console.log('ProtectedRoute - Token:', token);
  console.log('ProtectedRoute - UserID:', userId);
  
  if (!token || !userId) {
    console.log('ProtectedRoute - Redirecting to login due to missing:', !token ? 'token' : 'userId');
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  return children;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/login" element={
            token ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/signup" element={
            token ? <Navigate to="/dashboard" replace /> : <Signup />
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 