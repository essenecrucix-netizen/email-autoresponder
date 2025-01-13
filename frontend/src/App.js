import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Emails from './components/Emails';
import Dashboard from './components/Dashboard';
import KnowledgeBase from './components/KnowledgeBase';
import Analytics from './components/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route component
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }
    return children;
}

function App() {
    const token = localStorage.getItem('authToken');

    return (
        <Router>
            <Routes>
                <Route path="/login" element={
                    token ? <Navigate to="/dashboard" replace /> : <Login />
                } />
                <Route path="/signup" element={
                    token ? <Navigate to="/dashboard" replace /> : <Signup />
                } />
                <Route path="/*" element={
                    token ? (
                        <div className="app-container" data-name="app-container">
                            <Header />
                            <Sidebar />
                            <main className="content-area" data-name="main-content">
                                <Routes>
                                    <Route path="/dashboard" element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/emails" element={
                                        <ProtectedRoute>
                                            <Emails />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/knowledge-base" element={
                                        <ProtectedRoute>
                                            <KnowledgeBase />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/analytics" element={
                                        <ProtectedRoute>
                                            <Analytics />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/" element={
                                        <Navigate to="/dashboard" replace />
                                    } />
                                </Routes>
                            </main>
                        </div>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                } />
            </Routes>
        </Router>
    );
}

export default App;
