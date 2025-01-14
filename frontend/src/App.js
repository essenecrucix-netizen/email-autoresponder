import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './components/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import KnowledgeBase from './components/KnowledgeBase';
import Emails from './components/Emails';

function App() {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return !!(token && userId);
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
                    } />
                    <Route path="/signup" element={
                        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Signup />
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Protected Routes */}
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
                    <Route path="/knowledge-base" element={
                        <ProtectedRoute>
                            <KnowledgeBase />
                        </ProtectedRoute>
                    } />
                    <Route path="/emails" element={
                        <ProtectedRoute>
                            <Emails />
                        </ProtectedRoute>
                    } />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
