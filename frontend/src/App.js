import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './components/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return !!(token && userId);
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <Header />
                <Routes>
                    <Route path="/login" element={
                        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
                    } />
                    <Route path="/signup" element={
                        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Signup />
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
