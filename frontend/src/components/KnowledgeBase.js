import React, { useState } from 'react';

const KnowledgeBase = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents] = useState([
    { 
      name: 'Calamp 4230 and 3030- Scripts and Configurations.docs',
      size: '2.4 MB',
      lastModified: '2024-01-14'
    },
    {
      name: 'Calamp Order Process Flow.pdf',
      size: '1.8 MB',
      lastModified: '2024-01-13'
    },
    {
      name: 'Data Line Management Process.pdf',
      size: '3.2 MB',
      lastModified: '2024-01-12'
    }
  ]);

  const handleFileSelect = () => {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 200);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
        <p className="text-gray-600">Manage your documents and training materials</p>
      </div>

      <div className="mb-6">
        <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
          <span className="material-icons mr-2">sync</span>
          Sync Documents
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
        <p className="text-sm text-gray-600 mb-4">Supported formats: PDF, DOCX, TXT</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center">
            <span className="material-icons text-4xl text-gray-400 mb-2">cloud_upload</span>
            <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
            <button 
              onClick={handleFileSelect}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
            >
              Choose File
            </button>
          </div>
          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Size</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Modified</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="material-icons text-gray-400 mr-2">description</span>
                      <span className="text-gray-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doc.size}</td>
                  <td className="py-3 px-4 text-gray-600">{doc.lastModified}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View">
                        <span className="material-icons text-gray-600">visibility</span>
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                        <span className="material-icons text-gray-600">edit</span>
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                        <span className="material-icons text-gray-600">delete</span>
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
  );
};

export default KnowledgeBase;