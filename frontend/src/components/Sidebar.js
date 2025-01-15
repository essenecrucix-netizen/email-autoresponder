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
        <aside className="sidebar">
            {/* Logo Section */}
            <div className="p-4 border-b" style={{ borderColor: 'rgba(70, 130, 180, 0.2)' }}>
                <div className="flex items-center gap-3">
                    <span className="material-icons text-2xl" style={{ color: 'steelblue' }}>mail_outline</span>
                    <span className="font-semibold text-lg" style={{ color: 'steelblue' }}>Email Autoresponder</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-blue-50 text-primary' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                style={{ color: isActive ? 'steelblue' : undefined }}
                            >
                                <span 
                                    className="material-icons"
                                    style={{ color: isActive ? 'steelblue' : '#64748b' }}
                                >
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Quick Tip Section */}
            <div className="p-4 border-t mt-auto" style={{ borderColor: 'rgba(70, 130, 180, 0.2)' }}>
                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
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

