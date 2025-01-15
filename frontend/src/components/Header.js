import React from 'react';

function Header() {
    const userEmail = localStorage.getItem('userEmail') || 'erik@gfisystems.ca';

    return (
        <header className="header">
            <div className="flex items-center justify-between h-full">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-icons text-3xl" style={{ color: 'steelblue' }}>mail_outline</span>
                        <h1 className="text-xl font-semibold" style={{ color: 'steelblue' }}>Email Autoresponder</h1>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-icons text-gray-400">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Search emails, knowledge base..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-full" title="Notifications">
                            <span className="material-icons" style={{ color: 'steelblue' }}>notifications</span>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full" title="Settings">
                            <span className="material-icons" style={{ color: 'steelblue' }}>settings</span>
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                        <span className="material-icons text-gray-400">account_circle</span>
                        <span className="text-sm text-gray-600">{userEmail}</span>
                        <button className="p-1 hover:bg-gray-100 rounded-full" title="Logout">
                            <span className="material-icons text-gray-400">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
