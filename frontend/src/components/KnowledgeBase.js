import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';

function KnowledgeBase() {
    const [selectedFile, setSelectedFile] = useState(null);
    const {
        documents,
        loading,
        error,
        uploadProgress,
        uploadDocument,
        deleteDocument,
        viewDocument,
        refreshDocuments
    } = useKnowledgeBase();

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            try {
                await uploadDocument(file);
                setSelectedFile(null);
            } catch (error) {
                console.error('Failed to upload file:', error);
                setSelectedFile(null);
            }
        }
    };

    const handleViewDocument = async (doc) => {
        try {
            await viewDocument(doc.s3_key);
        } catch (error) {
            console.error('Failed to view document:', error);
        }
    };

    const handleDeleteDocument = async (doc) => {
        try {
            await deleteDocument(doc.id, doc.s3_key);
        } catch (error) {
            console.error('Failed to delete document:', error);
        }
    };

    const getFileIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'application/pdf':
            case 'pdf':
                return 'picture_as_pdf';
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/msword':
            case 'docx':
            case 'doc':
                return 'description';
            case 'text/plain':
            case 'txt':
                return 'text_snippet';
            default:
                return 'insert_drive_file';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="app-container">
                <Sidebar />
                <div className="content-area">
                    <Header />
                    <div className="main-content">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage your documents and training materials
                                </p>
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={refreshDocuments}
                            >
                                <span className="material-icons">cloud_sync</span>
                                Sync Documents
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="material-icons">error</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Section */}
                    <div className="card mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Upload Documents</h2>
                            <span className="text-sm text-gray-500">Supported formats: PDF, DOCX, TXT</span>
                        </div>
                        
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.docx,.txt"
                            />
                            <span className="material-icons text-4xl mb-4" style={{ color: 'steelblue' }}>
                                cloud_upload
                            </span>
                            <p className="text-gray-600 mb-4">
                                Drag and drop your files here, or click to browse
                            </p>
                            <label
                                htmlFor="file-upload"
                                className="file-upload-button"
                            >
                                Choose File
                            </label>
                        </div>

                        {selectedFile && uploadProgress > 0 && (
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
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Uploaded Documents</h2>
                            <div className="flex gap-2">
                                <button className="btn">
                                    <span className="material-icons" style={{ color: 'steelblue' }}>filter_list</span>
                                </button>
                                <button className="btn">
                                    <span className="material-icons" style={{ color: 'steelblue' }}>sort</span>
                                </button>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Size</th>
                                        <th>Last Modified</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc.id}>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-icons" style={{ color: 'steelblue' }}>
                                                        {getFileIcon(doc.type)}
                                                    </span>
                                                    <span className="font-medium">{doc.filename}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{formatFileSize(doc.size)}</td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(doc.last_modified).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    <button 
                                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                                        onClick={() => handleViewDocument(doc)}
                                                        title="View Document"
                                                    >
                                                        <span className="material-icons" style={{ color: 'steelblue' }}>visibility</span>
                                                    </button>
                                                    <button 
                                                        className="p-2 hover:bg-red-50 rounded-lg"
                                                        onClick={() => handleDeleteDocument(doc)}
                                                        title="Delete Document"
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