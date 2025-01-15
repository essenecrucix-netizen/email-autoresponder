import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail') || 'erik@gfisystems.ca';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    return (
        <header className="fixed top-0 right-0 left-[220px] h-[48px] bg-white border-b border-gray-200 flex items-center px-3">
            {/* Search */}
            <div className="relative flex-1 max-w-[400px]">
                <input
                    type="text"
                    placeholder="Search emails, knowledge base..."
                    className="w-full h-[32px] pl-8 pr-3 text-sm border border-gray-200 rounded"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                    <span className="material-icons text-gray-400 text-[18px]">search</span>
                </span>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 ml-auto">
                {/* User Email */}
                <div className="text-sm text-gray-600">
                    {userEmail}
                </div>

                {/* Logout */}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 ml-3 text-sm text-gray-600 hover:bg-gray-50 rounded px-2 py-1"
                >
                    <span className="material-icons text-[18px]">logout</span>
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;
