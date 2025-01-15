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
        <aside className="fixed left-0 top-0 h-screen w-[220px] bg-white border-r border-gray-200">
            {/* Logo Section */}
            <div className="flex items-center gap-2 p-3">
                <span className="material-icons text-[steelblue]">mail</span>
                <span className="text-[steelblue] font-medium">Email Autoresponder</span>
            </div>

            {/* Navigation */}
            <nav className="mt-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2 px-3 py-2 text-sm ${
                                isActive 
                                    ? 'text-[steelblue] bg-blue-50' 
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
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-xs">
                    <div className="flex items-center gap-1 text-[steelblue] mb-1">
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

