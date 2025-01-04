import React from 'react';
import AWS from 'aws-sdk';

// Configure AWS S3
AWS.config.update({
    region: process.env.REACT_APP_AWS_REGION, // Replace with your AWS region
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID, // Replace with your AWS Access Key
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY, // Replace with your AWS Secret Key
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME; // Replace with your S3 bucket name

function KnowledgeBase() {
    const [files, setFiles] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [previewContent, setPreviewContent] = React.useState('');

    // Load files from S3
    async function loadFiles() {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Prefix: 'knowledge-base/',
            };
            const response = await s3.listObjectsV2(params).promise();
            const fileKeys = response.Contents.map(item => item.Key);
            setFiles(fileKeys);
        } catch (error) {
            console.error('Error loading files from S3:', error);
        }
    }

    // Handle file upload to S3
    async function handleFileUpload(event) {
        try {
            setUploading(true);
            const file = event.target.files[0];
            const params = {
                Bucket: BUCKET_NAME,
                Key: `knowledge-base/${file.name}`,
                Body: file,
                ContentType: file.type,
            };
            await s3.upload(params).promise();
            await loadFiles();
        } catch (error) {
            console.error('Error uploading file to S3:', error);
        } finally {
            setUploading(false);
        }
    }

    // Handle file preview
    async function previewFile(key) {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
            };
            const url = s3.getSignedUrl('getObject', params);
            setSelectedFile({ key, url });
        } catch (error) {
            console.error('Error generating file preview:', error);
        }
    }

    // Delete file from S3
    async function deleteFile(key) {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
            };
            await s3.deleteObject(params).promise();
            await loadFiles();
            if (selectedFile?.key === key) {
                setSelectedFile(null);
                setPreviewContent('');
            }
        } catch (error) {
            console.error('Error deleting file from S3:', error);
        }
    }

    React.useEffect(() => {
        loadFiles();
    }, []);

    return (
        <div className="knowledge-base-container grid grid-cols-2 gap-4">
            <div className="files-section">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Knowledge Base</h2>
                    <div className="upload-section">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                            accept=".txt,.pdf,.doc,.docx"
                        />
                        <label
                            htmlFor="file-upload"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700"
                        >
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </label>
                    </div>
                </div>
                <div className="files-grid space-y-4">
                    {files.map((key) => (
                        <div
                            key={key}
                            className={`card flex justify-between items-center cursor-pointer ${
                                selectedFile?.key === key ? 'border-blue-500 border-2' : ''
                            }`}
                            onClick={() => previewFile(key)}
                        >
                            <div>
                                <h3 className="font-medium">{key.split('/').pop()}</h3>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFile(key);
                                }}
                                className="text-red-600 hover:text-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="preview-section">
                <div className="card h-full">
                    <h3 className="text-lg font-medium mb-4">File Preview</h3>
                    {selectedFile ? (
                        selectedFile.url.includes('.pdf') ? (
                            <iframe src={selectedFile.url} className="w-full h-[600px]" title="PDF Preview" />
                        ) : (
                            <a href={selectedFile.url} target="_blank" rel="noopener noreferrer">
                                Download and Open
                            </a>
                        )
                    ) : (
                        <div className="text-gray-500 text-center">Select a file to preview</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default KnowledgeBase;
