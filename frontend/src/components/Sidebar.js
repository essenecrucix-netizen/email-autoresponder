import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
    const location = useLocation();
    
    const menuItems = [
        {
            path: '/dashboard',
            icon: 'dashboard',
            label: 'Dashboard',
            description: 'Overview of system performance'
        },
        {
            path: '/emails',
            icon: 'mail',
            label: 'Emails',
            description: 'Manage incoming emails and responses'
        },
        {
            path: '/knowledge-base',
            icon: 'library_books',
            label: 'Knowledge Base',
            description: 'Manage training documents'
        },
        {
            path: '/analytics',
            icon: 'insights',
            label: 'Analytics',
            description: 'View system metrics and performance'
        }
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r" style={{ borderColor: 'steelblue' }}>
            <div className="flex flex-col h-full">
                <div className="space-y-6 flex-1 px-4 py-6">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-start p-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-blue-50' 
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <span 
                                    className="material-icons mr-3" 
                                    style={{ color: isActive ? 'steelblue' : '#64748b' }}
                                >
                                    {item.icon}
                                </span>
                                <div>
                                    <div className="font-medium" style={{ color: isActive ? 'steelblue' : '#1e293b' }}>
                                        {item.label}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-0.5">
                                        {item.description}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t" style={{ borderColor: 'rgba(70, 130, 180, 0.2)' }}>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-icons" style={{ color: 'steelblue' }}>tips_and_updates</span>
                            <h3 className="font-medium" style={{ color: 'steelblue' }}>Quick Tip</h3>
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

