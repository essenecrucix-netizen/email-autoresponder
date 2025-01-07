import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'emails', label: 'Emails', icon: '📧', path: '/emails' },
        { id: 'knowledge', label: 'Knowledge Base', icon: '📚', path: '/knowledge-base' },
        { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' }
    ];

    return (
        <div className="fixed w-64 h-full bg-gray-800 text-white" data-name="sidebar">
            <nav className="mt-8">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) =>
                            `px-6 py-3 cursor-pointer hover:bg-gray-700 ${
                                isActive ? 'bg-gray-700' : ''
                            }`
                        }
                        data-name={`sidebar-item-${item.id}`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

export default Sidebar;

