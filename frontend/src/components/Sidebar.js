import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/emails', icon: 'mail', label: 'Emails' },
  { path: '/knowledge-base', icon: 'folder', label: 'Knowledge Base' },
  { path: '/settings', icon: 'settings', label: 'Settings' }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo section */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Email Bot</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="material-icons mr-3 text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Quick Tip */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              Upload documents to the Knowledge Base to improve response accuracy.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

