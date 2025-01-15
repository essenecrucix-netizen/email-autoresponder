import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function KnowledgeBase() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: 'Calamp 4230 and 3030- Scripts and Configurations.docx',
            type: 'docx',
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
    ]);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Start upload progress simulation
            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        // Add the file to documents list
                        const newDoc = {
                            id: documents.length + 1,
                            name: file.name,
                            type: file.name.split('.').pop().toLowerCase(),
                            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                            lastModified: new Date().toISOString().split('T')[0]
                        };
                        setDocuments(prev => [...prev, newDoc]);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 300);
        }
    };

    const getFileIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'pdf':
                return 'picture_as_pdf';
            case 'docx':
            case 'doc':
                return 'description';
            case 'txt':
                return 'text_snippet';
            default:
                return 'insert_drive_file';
        }
    };

    const handleDeleteDocument = (id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-area">
                <Header />
                <div className="space-y-6 p-6" style={{ backgroundColor: '#f8f9fa' }}>
                    {/* Header Section */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm" style={{ borderLeft: '4px solid steelblue' }}>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage your documents and training materials
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn" style={{ backgroundColor: 'steelblue', color: 'white', padding: '8px 16px', borderRadius: '6px' }}>
                                <span className="material-icons">cloud_sync</span>
                                Sync Documents
                            </button>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Upload Documents</h2>
                            <span className="text-sm text-gray-500">Supported formats: PDF, DOCX, TXT</span>
                        </div>
                        
                        <div className="border-2 border-dashed rounded-lg p-8" style={{ borderColor: 'rgba(70, 130, 180, 0.3)' }}>
                            <div className="flex flex-col items-center justify-center">
                                <span className="material-icons text-4xl mb-4" style={{ color: 'steelblue' }}>
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
                                    className="cursor-pointer px-4 py-2 rounded-lg"
                                    style={{ backgroundColor: 'steelblue', color: 'white' }}
                                >
                                    Choose File
                                </label>
                            </div>
                        </div>

                        {selectedFile && uploadProgress < 100 && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{selectedFile.name}</span>
                                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%`, backgroundColor: 'steelblue' }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Documents List */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Uploaded Documents</h2>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-50 rounded-lg">
                                    <span className="material-icons" style={{ color: 'steelblue' }}>filter_list</span>
                                </button>
                                <button className="p-2 hover:bg-gray-50 rounded-lg">
                                    <span className="material-icons" style={{ color: 'steelblue' }}>sort</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: 'rgba(70, 130, 180, 0.2)' }}>
                                        <th className="text-left py-3 px-4">Name</th>
                                        <th className="text-left py-3 px-4">Size</th>
                                        <th className="text-left py-3 px-4">Last Modified</th>
                                        <th className="text-right py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr 
                                            key={doc.id} 
                                            className="border-b hover:bg-gray-50"
                                            style={{ borderColor: 'rgba(70, 130, 180, 0.1)' }}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-icons" style={{ color: 'steelblue' }}>
                                                        {getFileIcon(doc.type)}
                                                    </span>
                                                    <span className="font-medium">{doc.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{doc.size}</td>
                                            <td className="py-3 px-4 text-gray-600">{doc.lastModified}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                        <span className="material-icons" style={{ color: 'steelblue' }}>visibility</span>
                                                    </button>
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                        <span className="material-icons" style={{ color: 'steelblue' }}>edit</span>
                                                    </button>
                                                    <button 
                                                        className="p-2 hover:bg-red-50 rounded-lg"
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                    >
                                                        <span className="material-icons text-red-500">delete</span>
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