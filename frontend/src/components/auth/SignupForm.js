function SignupForm() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });
    const [error, setError] = React.useState('');
    const auth = Auth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
    
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
    
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
    
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                const { message } = await response.json();
                setError(message || 'Signup failed. Please try again.');
                return;
            }
    
            window.location.href = '/login';
        } catch (error) {
            console.error('Error during signup:', error);
            setError('Signup failed. Please try again.');
        }
    }    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" data-name="signup-container">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md" data-name="signup-form">
                <h2 className="text-2xl font-bold text-center">Create your account</h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded" data-name="error-message">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                data-name="name-input"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                data-name="email-input"
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
                                minLength="8"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                data-name="password-input"
                            />
                            <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters long</p>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                data-name="confirm-password-input"
                            />
                        </div>
                        {formData.role === 'admin' && (
                            <div>
                                <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">
                                    Admin Code
                                </label>
                                <input
                                    id="adminCode"
                                    type="password"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    data-name="admin-code-input"
                                />
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
                        data-name="submit-button"
                    >
                        Sign up
                    </button>
                </form>
            </div>
        </div>
    );
}