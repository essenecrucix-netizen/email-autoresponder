import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function KnowledgeBase() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Simulate upload progress
            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 500);
        }
    };

    const documents = [
        {
            id: 1,
            name: 'Calamp 4230 and 3030- Scripts and Configurations.docx',
            type: 'document',
            size: '2.4 MB',
            lastModified: '2024-01-14'
        },
        {
            id: 2,
            name: 'Calamp Order Process Flow.pdf',
            type: 'pdf',
            size: '1.8 MB',
            lastModified: '2024-01-13'
        },
        {
            id: 3,
            name: 'Data Line Management Process.pdf',
            type: 'pdf',
            size: '3.2 MB',
            lastModified: '2024-01-12'
        }
    ];

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf':
                return 'picture_as_pdf';
            case 'document':
                return 'description';
            default:
                return 'insert_drive_file';
        }
    };

    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-area">
                <Header />
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage your documents and training materials
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn btn-primary">
                                <span className="material-icons">cloud_sync</span>
                                Sync Documents
                            </button>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Upload Documents</h2>
                            <span className="text-sm text-gray-500">Supported formats: PDF, DOCX, TXT</span>
                        </div>
                        
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
                            <div className="flex flex-col items-center justify-center">
                                <span className="material-icons text-4xl text-gray-400 mb-4">
                                    cloud_upload
                                </span>
                                <p className="text-gray-600 mb-4">
                                    Drag and drop your files here, or click to browse
                                </p>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.docx,.txt"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="btn btn-primary cursor-pointer"
                                >
                                    <span className="material-icons">add</span>
                                    Choose File
                                </label>
                            </div>
                        </div>

                        {selectedFile && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documents List */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Uploaded Documents</h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-50 rounded-lg">
                                    <span className="material-icons text-gray-400">filter_list</span>
                                </button>
                                <button className="p-2 hover:bg-gray-50 rounded-lg">
                                    <span className="material-icons text-gray-400">sort</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Size</th>
                                        <th>Last Modified</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50">
                                            <td className="flex items-center gap-3">
                                                <span className="material-icons text-gray-400">
                                                    {getFileIcon(doc.type)}
                                                </span>
                                                {doc.name}
                                            </td>
                                            <td>{doc.size}</td>
                                            <td>{doc.lastModified}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                        <span className="material-icons text-gray-400">visibility</span>
                                                    </button>
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                        <span className="material-icons text-gray-400">edit</span>
                                                    </button>
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg text-red-400">
                                                        <span className="material-icons">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KnowledgeBase;