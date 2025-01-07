import React from 'react';

function Sidebar() {
    const [activeItem, setActiveItem] = React.useState('dashboard');

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'emails', label: 'Emails', icon: '📧' },
        { id: 'knowledge', label: 'Knowledge Base', icon: '📚' },
        { id: 'analytics', label: 'Analytics', icon: '📈' }
    ];

    return (
        <div className="fixed w-64 h-full bg-gray-800 text-white" data-name="sidebar">
            <nav className="mt-8">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`px-6 py-3 cursor-pointer hover:bg-gray-700 ${
                            activeItem === item.id ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => setActiveItem(item.id)}
                        data-name={`sidebar-item-${item.id}`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </nav>
        </div>
    );
}

export default Sidebar; // Add default export

