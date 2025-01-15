import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
    const menuItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: 'dashboard', 
            path: '/dashboard' 
        },
        { 
            id: 'emails', 
            label: 'Emails', 
            icon: 'email',
            path: '/emails' 
        },
        { 
            id: 'knowledge', 
            label: 'Knowledge Base', 
            icon: 'library_books',
            path: '/knowledge-base' 
        },
        { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: 'analytics',
            path: '/analytics' 
        }
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-white border-r border-gray-200 z-20">
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="material-icons text-white">mail</span>
                    </div>
                    <div className="font-semibold text-lg text-gray-900">
                        AI Email Bot
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors ${
                                    isActive ? 'bg-gray-50 text-primary border-r-2 border-primary' : ''
                                }`
                            }
                        >
                            <span className="material-icons">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="border-t border-gray-200 p-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="material-icons text-primary">tips_and_updates</span>
                            <h3 className="font-medium text-gray-900">Quick Tip</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Upload documents to the Knowledge Base to improve response accuracy.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;

