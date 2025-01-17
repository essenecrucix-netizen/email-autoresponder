import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import axios from 'axios';

const KnowledgeBase = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [textPreview, setTextPreview] = useState('');
  const [showTextPreview, setShowTextPreview] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      setFetchError('');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setFetchError('Failed to fetch documents. Please try again later.');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh document list after successful upload
      await fetchDocuments();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.status === 401 
        ? 'Authentication failed. Please log in again.'
        : 'Failed to upload file. Please try again.';
      alert(errorMessage);
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handlePreview = async (doc) => {
    try {
      setSelectedFile(doc);
      setPreviewLoading(true);
      setPreviewError('');
      setIsPreviewOpen(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await axios.get(`/api/documents/${encodeURIComponent(doc.s3_key)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.type === 'pdf') {
        setPreviewContent(`data:application/pdf;base64,${response.data.content}`);
      } else {
        setPreviewContent(response.data.content);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setPreviewError(
        error.response?.status === 401 
          ? 'Authentication failed. Please log in again.'
          : 'Failed to load document preview. Please try again.'
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedFile(null);
    setPreviewContent('');
    setPreviewError('');
    setPdfPreviewUrl('');
    setShowPdfPreview(false);
    setTextPreview('');
    setShowTextPreview(false);
  };

  const PreviewModal = () => {
    if (!isPreviewOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-3/4 h-3/4 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">{selectedFile?.filename}</h3>
            <button 
              onClick={closePreview}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {previewLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : previewError ? (
              <div className="text-red-500 text-center">{previewError}</div>
            ) : selectedFile?.type === 'application/pdf' ? (
              <iframe
                src={previewContent}
                className="w-full h-full"
                title="PDF Preview"
              />
            ) : (
              <div className="prose max-w-none whitespace-pre-wrap">{previewContent}</div>
            )}
          </div>
        </div>
      </div>
    );
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
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
              {documents.map((doc) => (
                <tr key={doc.s3_key} className="border-b border-gray-200 last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="material-icons text-gray-400 mr-2">description</span>
                      <span className="text-gray-900">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {doc.size ? `${(doc.size / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded" 
                        title="View"
                        onClick={() => handlePreview(doc)}
                      >
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

      <PreviewModal />
    </div>
  );
};

export default KnowledgeBase;