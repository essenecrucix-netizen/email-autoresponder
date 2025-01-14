// Example Emails.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import axios from '../utils/axios';

function Emails() {
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            const response = await axios.get('/api/emails');
            setEmails(response.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch emails');
            setLoading(false);
        }
    };

    const handleEmailClick = (email) => {
        setSelectedEmail(email);
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        <div>Loading...</div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        <div>Error: {error}</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Email List */}
                        <div className="col-span-1 bg-white rounded-lg shadow">
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-4">Emails</h2>
                                <div className="space-y-4">
                                    {Array.isArray(emails) && emails.map((email) => (
                                        <div
                                            key={email.email_id}
                                            className={`p-3 rounded cursor-pointer ${
                                                selectedEmail?.email_id === email.email_id
                                                    ? 'bg-blue-50'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => handleEmailClick(email)}
                                        >
                                            <div className="font-medium">{email.subject}</div>
                                            <div className="text-sm text-gray-500">{email.sender}</div>
                                            <div className="text-sm text-gray-400">
                                                {new Date(email.received_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                    {Array.isArray(emails) && emails.length === 0 && (
                                        <div className="text-center text-gray-500">
                                            No emails found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Email Details */}
                        <div className="col-span-2 bg-white rounded-lg shadow">
                            <div className="p-4">
                                {selectedEmail ? (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">
                                            {selectedEmail.subject}
                                        </h2>
                                        <div className="mb-4">
                                            <div className="text-gray-600">
                                                From: {selectedEmail.sender}
                                            </div>
                                            <div className="text-gray-600">
                                                Received:{' '}
                                                {new Date(
                                                    selectedEmail.received_at
                                                ).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="prose max-w-none">
                                            {selectedEmail.content}
                                        </div>
                                        {selectedEmail.response && (
                                            <div className="mt-6">
                                                <h3 className="text-lg font-semibold mb-2">
                                                    Response
                                                </h3>
                                                <div className="bg-gray-50 p-4 rounded">
                                                    {selectedEmail.response}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        Select an email to view details
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Emails;

