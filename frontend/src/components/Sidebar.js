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
            icon: 'analytics',
            label: 'Analytics'
        }
    ];

    return (
        <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-200">
            {/* Logo Section */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                <span className="material-icons text-primary">mail</span>
                <span className="font-medium text-primary">Email Autoresponder</span>
            </div>

            {/* Navigation */}
            <nav className="p-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                                isActive 
                                    ? 'text-primary bg-blue-50' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span className="material-icons text-[20px]">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Tip */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="text-xs">
                    <div className="flex items-center gap-1 text-primary mb-1">
                        <span className="material-icons text-[14px]">tips_and_updates</span>
                        Quick Tip
                    </div>
                    <p className="text-gray-600">
                        Upload documents to improve response accuracy
                    </p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;

