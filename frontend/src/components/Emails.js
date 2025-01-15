// Example Emails.js
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function Emails() {
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const emails = [
        {
            id: 1,
            subject: 'Technical Support Required',
            sender: 'customer@example.com',
            preview: 'I need help with configuring the FleetCam device...',
            timestamp: '2024-01-14 14:30',
            status: 'pending',
            priority: 'high'
        },
        {
            id: 2,
            subject: 'Order Inquiry #1234',
            sender: 'sales@client.com',
            preview: 'I would like to know the status of my order...',
            timestamp: '2024-01-14 13:15',
            status: 'responded',
            priority: 'medium'
        },
        {
            id: 3,
            subject: 'Integration Question',
            sender: 'dev@company.com',
            preview: 'We are trying to integrate your API with our system...',
            timestamp: '2024-01-14 11:45',
            status: 'escalated',
            priority: 'high'
        }
    ];

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

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high':
                return 'priority_high';
            case 'medium':
                return 'drag_handle';
            case 'low':
                return 'low_priority';
            default:
                return 'remove';
        }
    };

    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-area">
                <Header />
                <div className="main-content">
                    {/* Header Section */}
                    <div className="card mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Email Management</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    View and manage automated email responses
                                </p>
                            </div>
                            <button className="btn btn-primary">
                                <span className="material-icons">refresh</span>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Email Status Filters */}
                    <div className="flex gap-2 mb-6">
                        <button 
                            className={`btn ${filterStatus === 'all' ? 'btn-primary' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`btn ${filterStatus === 'pending' ? 'btn-primary' : ''}`}
                            onClick={() => setFilterStatus('pending')}
                        >
                            Pending
                        </button>
                        <button 
                            className={`btn ${filterStatus === 'responded' ? 'btn-primary' : ''}`}
                            onClick={() => setFilterStatus('responded')}
                        >
                            Responded
                        </button>
                        <button 
                            className={`btn ${filterStatus === 'escalated' ? 'btn-primary' : ''}`}
                            onClick={() => setFilterStatus('escalated')}
                        >
                            Escalated
                        </button>
                    </div>

                    {/* Email List and Preview */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Email List */}
                        <div className="col-span-12 lg:col-span-5">
                            <div className="space-y-4">
                                {emails
                                    .filter(email => filterStatus === 'all' || email.status === filterStatus)
                                    .map(email => (
                                        <div
                                            key={email.id}
                                            className={`card cursor-pointer transition-shadow hover:shadow-md ${
                                                selectedEmail?.id === email.id ? 'border-2 border-primary' : ''
                                            }`}
                                            onClick={() => setSelectedEmail(email)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-gray-900">{email.subject}</h3>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(email.status)}`}>
                                                    {email.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <span className="material-icons text-sm">
                                                    {getPriorityIcon(email.priority)}
                                                </span>
                                                <span>{email.sender}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{email.preview}</p>
                                            <div className="mt-2 text-xs text-gray-400">{email.timestamp}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Email Preview */}
                        <div className="col-span-12 lg:col-span-7 card">
                            {selectedEmail ? (
                                <div className="space-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-icons text-gray-400">account_circle</span>
                                                <span className="text-sm text-gray-600">{selectedEmail.sender}</span>
                                            </div>
                                            <div className="text-sm text-gray-400">{selectedEmail.timestamp}</div>
                                        </div>
                                    </div>
                                    <div className="prose max-w-none">
                                        <p>{selectedEmail.preview}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="btn btn-primary">
                                            <span className="material-icons">reply</span>
                                            Reply
                                        </button>
                                        <button className="btn btn-primary">
                                            <span className="material-icons">escalator</span>
                                            Escalate
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <span className="material-icons text-4xl mb-2">email</span>
                                    <p>Select an email to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Emails;

