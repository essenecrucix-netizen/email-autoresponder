import React from 'react';
import { useLocation } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';

function Signup() {
    const location = useLocation();
    const redirectPath = location.state?.from?.pathname || '/dashboard';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <SignupForm />
                <div className="text-center mt-4">
                    <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                        Already have an account? Log in
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Signup; 