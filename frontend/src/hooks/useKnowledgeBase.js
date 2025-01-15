import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import AWS from 'aws-sdk';

export function useKnowledgeBase() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Configure AWS
    AWS.config.update({
        region: process.env.REACT_APP_AWS_REGION,
        credentials: new AWS.Credentials({
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        }),
    });

    const s3 = new AWS.S3();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/knowledge-base/documents');
            setDocuments(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const uploadDocument = async (file) => {
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const params = {
                Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                Key: `${process.env.REACT_APP_USER_ID}/${fileName}`,
                Body: file,
                ContentType: file.type,
            };

            // Upload to S3
            const upload = s3.upload(params);
            
            upload.on('httpUploadProgress', (progress) => {
                const percentage = Math.round((progress.loaded * 100) / progress.total);
                setUploadProgress(percentage);
            });

            const result = await upload.promise();

            // Save document metadata to DynamoDB through our API
            const documentData = {
                user_id: process.env.REACT_APP_USER_ID,
                filename: file.name,
                s3_key: result.Key,
                size: file.size,
                type: file.type,
                last_modified: new Date().toISOString()
            };

            await axios.post('/api/knowledge-base/documents', documentData);
            
            // Refresh document list
            await fetchDocuments();
            setUploadProgress(0);
            return result;
        } catch (err) {
            console.error('Error uploading document:', err);
            setError('Failed to upload document');
            setUploadProgress(0);
            throw err;
        }
    };

    const deleteDocument = async (documentId, s3Key) => {
        try {
            // Delete from S3
            const s3Params = {
                Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                Key: s3Key
            };

            await s3.deleteObject(s3Params).promise();

            // Delete from DynamoDB through our API
            await axios.delete(`/api/knowledge-base/documents/${documentId}`);

            // Refresh document list
            await fetchDocuments();
        } catch (err) {
            console.error('Error deleting document:', err);
            setError('Failed to delete document');
            throw err;
        }
    };

    const viewDocument = async (s3Key) => {
        try {
            const params = {
                Bucket: process.env.REACT_APP_S3_BUCKET_NAME,
                Key: s3Key,
                Expires: 60 // URL expires in 60 seconds
            };

            const url = await s3.getSignedUrlPromise('getObject', params);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Error generating document URL:', err);
            setError('Failed to view document');
            throw err;
        }
    };

    return {
        documents,
        loading,
        error,
        uploadProgress,
        uploadDocument,
        deleteDocument,
        viewDocument,
        refreshDocuments: fetchDocuments
    };
} 