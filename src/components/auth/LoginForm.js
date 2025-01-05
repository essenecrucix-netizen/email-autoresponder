function LoginForm() {
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    });
    const [error, setError] = React.useState('');
    const auth = Auth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                setError('Invalid email or password');
                return;
            }
    
            const { user, token } = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token); // Optional for secure routes
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Error during login:', error);
            setError('Login failed. Please try again.');
        }
    }    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" data-name="login-container">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md" data-name="login-form">
                <h2 className="text-2xl font-bold text-center">Sign in to your account</h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded" data-name="error-message">
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                data-name="password-input"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
                        data-name="submit-button"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}
