import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Invalid email or password');
            }
    
            // Store the auth token
            localStorage.setItem('authToken', data.token);
            
            // Navigate to the redirect path or dashboard
            const from = location.state?.from || '/dashboard';
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Error during login:', error);
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }    

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-900">Sign in to your account</h2>
            </div>
            
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
        </div>
    );
}

export default LoginForm;
