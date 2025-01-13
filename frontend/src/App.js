import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return !!(token && userId);
    };

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated() ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route
                    path="/signup"
                    element={
                        isAuthenticated() ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Signup />
                        )
                    }
                />

                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect root to dashboard */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                {/* Catch all route */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;
