import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
    const location = useLocation();
    
    const menuItems = [
        {
            path: '/dashboard',
            icon: 'dashboard',
            label: 'Dashboard'
        },
        {
            path: '/emails',
            icon: 'mail',
            label: 'Emails'
        },
        {
            path: '/knowledge-base',
            icon: 'library_books',
            label: 'Knowledge Base'
        },
        {
            path: '/analytics',
            icon: 'insights',
            label: 'Analytics'
        }
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r" style={{ borderColor: 'steelblue' }}>
            {/* Logo Section */}
            <div className="p-4 border-b" style={{ borderColor: 'steelblue' }}>
                <div className="flex items-center gap-3">
                    <span className="material-icons text-2xl" style={{ color: 'steelblue' }}>mail_outline</span>
                    <span className="font-semibold text-lg" style={{ color: 'steelblue' }}>Email Autoresponder</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive 
                                    ? 'bg-blue-50' 
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <span 
                                className="material-icons" 
                                style={{ color: isActive ? 'steelblue' : '#64748b' }}
                            >
                                {item.icon}
                            </span>
                            <span 
                                className="font-medium"
                                style={{ color: isActive ? 'steelblue' : '#1e293b' }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Tip Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'rgba(70, 130, 180, 0.2)' }}>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-icons text-sm" style={{ color: 'steelblue' }}>tips_and_updates</span>
                        <span className="font-medium text-sm" style={{ color: 'steelblue' }}>Quick Tip</span>
                    </div>
                    <p className="text-xs text-gray-600">
                        Upload documents to improve response accuracy
                    </p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;

