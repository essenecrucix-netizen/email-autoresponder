import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle success message from signup
    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await axios.post('/api/login', { email: formData.email, password: formData.password });
            console.log('Login response:', response);
            
            if (response.status === 200 && response.data.token) {
                // Store the token and user ID
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userId', response.data.user.id || '123'); // Default to '123' if id not in response
                
                // Set success message
                setSuccess('Login successful! Redirecting to dashboard...');
                
                // Redirect after a short delay
                setTimeout(() => {
                    navigate(location.state?.from || '/dashboard', { replace: true });
                }, 1500);
            } else {
                setError('Invalid response from server');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded" role="alert">
                    {success}
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded" role="alert">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            disabled={loading}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
            
            <div className="text-center mt-4">
                <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-500">
                    Don't have an account? Sign up
                </Link>
            </div>
        </div>
    );
}

export default LoginForm;
