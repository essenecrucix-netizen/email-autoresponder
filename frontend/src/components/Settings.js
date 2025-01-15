import React from 'react';

const Settings = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and application settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
        
        <div className="space-y-6">
          {/* Email Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value="erik@gfisystems.ca"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          {/* API Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value="••••••••••••••••"
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
                Regenerate
              </button>
            </div>
          </div>

          {/* Response Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Response Delay (seconds)</label>
            <input
              type="number"
              defaultValue={30}
              min={0}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 