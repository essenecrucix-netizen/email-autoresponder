import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        console.log('ProtectedRoute check:', {
            path: location.pathname,
            token: !!token,
            userId: !!userId
        });
    }, [location.pathname, token, userId]);

    if (!token || !userId) {
        console.log('No token or userId, redirecting to login');
        // Save the attempted path to redirect back after login
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute; 