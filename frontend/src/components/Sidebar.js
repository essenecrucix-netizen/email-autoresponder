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
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo section */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200">
          <span className="material-icons text-primary">mail</span>
          <span className="font-semibold text-primary">Email Bot</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center h-10 px-3 mb-1 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="material-icons mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Quick Tip */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center gap-1 mb-1 text-blue-800">
              <span className="material-icons text-sm">tips_and_updates</span>
              <span className="text-sm font-medium">Quick Tip</span>
            </div>
            <p className="text-xs text-blue-800">
              Upload documents to improve response accuracy
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

