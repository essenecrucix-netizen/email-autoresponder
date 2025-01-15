import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail') || 'erik@gfisystems.ca';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <header className="fixed top-0 right-0 left-[var(--sidebar-width)] h-[var(--header-height)] bg-white border-b border-gray-200 z-10">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search emails, knowledge base..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="p-2 hover:bg-gray-50 rounded-lg relative">
                        <span className="material-icons text-gray-600">notifications</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <button className="p-2 hover:bg-gray-50 rounded-lg">
                        <span className="material-icons text-gray-600">settings</span>
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900">Admin User</span>
                            <span className="text-xs text-gray-500">{userEmail}</span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-50 rounded-lg"
                        >
                            <span className="material-icons text-gray-600">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
