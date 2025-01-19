// Example Emails.js
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Emails = () => {
  const [emails] = useState([
    {
      id: 1,
      subject: 'Technical Support Required',
      sender: 'customer@example.com',
      preview: 'I need help with configuring the FleetCam device...',
      timestamp: '2024-01-14 14:30',
      status: 'pending'
    },
    {
      id: 2,
      subject: 'Order Inquiry #1234',
      sender: 'sales@client.com',
      preview: 'I would like to know the status of my order...',
      timestamp: '2024-01-14 13:15',
      status: 'responded'
    },
    {
      id: 3,
      subject: 'Integration Question',
      sender: 'dev@company.com',
      preview: 'We are trying to integrate your API with our system...',
      timestamp: '2024-01-14 11:45',
      status: 'escalated'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Management</h1>
        <p className="text-gray-600">View and manage automated email responses</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
            All
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Pending
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Responded
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Escalated
          </button>
        </div>

        <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
          <span className="material-icons mr-2">refresh</span>
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {emails.map((email) => (
          <div key={email.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{email.subject}</h3>
                  <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                    {email.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="material-icons text-gray-400 text-base mr-1">person</span>
                  {email.sender}
                  <span className="mx-2">•</span>
                  <span className="material-icons text-gray-400 text-base mr-1">schedule</span>
                  {email.timestamp}
                </div>
                <p className="text-gray-600">{email.preview}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 hover:bg-gray-100 rounded-full" title="View">
                  <span className="material-icons text-gray-600">visibility</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full" title="Reply">
                  <span className="material-icons text-gray-600">reply</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full" title="More">
                  <span className="material-icons text-gray-600">more_vert</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Emails;

