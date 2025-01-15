import React from 'react';

const Header = () => {
  const userEmail = localStorage.getItem('userEmail') || 'erik@gfisystems.ca';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Email Autoresponder</h1>
          
          <div className="ml-8 max-w-lg w-full">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-icons text-gray-400">search</span>
              </span>
              <input
                type="text"
                placeholder="Search emails, knowledge base..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full" title="Notifications">
            <span className="material-icons text-gray-600">notifications</span>
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-full" title="Settings">
            <span className="material-icons text-gray-600">settings</span>
          </button>

          <div className="border-l border-gray-200 h-6 mx-2"></div>

          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">{userEmail}</span>
            <button className="p-2 hover:bg-gray-100 rounded-full" title="Logout">
              <span className="material-icons text-gray-600">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
