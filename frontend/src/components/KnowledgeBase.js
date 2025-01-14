import React from 'react';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Header from './Header';
import Sidebar from './Sidebar';

// Initialize S3 and DynamoDB clients
const s3Client = new S3Client({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
});

const dynamoClient = new DynamoDBClient({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
});

const dynamodb = DynamoDBDocumentClient.from(dynamoClient);
const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
const USER_ID = process.env.REACT_APP_USER_ID;

function KnowledgeBase() {
    const [files, setFiles] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [previewFileData, setPreviewFileData] = React.useState(null);
    const [previewContent, setPreviewContent] = React.useState(null);

    // Load files from DynamoDB
    async function loadFiles() {
        try {
            const params = {
                TableName: 'user_knowledge_files',
                KeyConditionExpression: 'user_id = :user_id',
                ExpressionAttributeValues: {
                    ':user_id': USER_ID,
                },
            };
            const response = await dynamodb.send(new QueryCommand(params));
            setFiles(response.Items || []);
        } catch (error) {
            console.error('Error loading files from DynamoDB:', error);
        }
    }

    // Handle file selection
    function handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('Selected file:', file.name);
            setSelectedFile(file);
        }
    }

    // Handle file upload to S3 and save metadata to DynamoDB
    async function handleFileUpload() {
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        try {
            setUploading(true);
            const s3Key = `${USER_ID}/${selectedFile.name}`;

            // Upload file to S3
            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: selectedFile,
                ContentType: selectedFile.type,
            };
            console.log('Uploading file to S3:', uploadParams);
            await s3Client.send(new PutObjectCommand(uploadParams));

            // Save file metadata to DynamoDB
            const dbParams = {
                TableName: 'user_knowledge_files',
                Item: {
                    user_id: USER_ID,
                    s3_key: s3Key,
                    filename: selectedFile.name,
                    uploaded_at: new Date().toISOString(),
                },
            };
            console.log('Saving metadata to DynamoDB:', dbParams);
            await dynamodb.send(new PutCommand(dbParams));

            await loadFiles();
            setSelectedFile(null);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('An error occurred during the file upload. Please check the console for more details.');
        } finally {
            setUploading(false);
        }
    }

    // Handle file preview
    async function previewFile(file) {
        try {
            const params = {
                Bucket: BUCKET_NAME,
                Key: file.s3_key,
            };
            const url = await getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: 3600 });

            if (file.filename.endsWith('.txt')) {
                const response = await fetch(url);
                const textContent = await response.text();
                setPreviewContent({ type: 'text', content: textContent });
            } else if (file.filename.endsWith('.pdf')) {
                setPreviewContent({ type: 'pdf', url });
            } else if (file.filename.endsWith('.docx')) {
                setPreviewContent({ type: 'docx', url: `https://docs.google.com/gview?url=${url}&embedded=true` });
            } else {
                setPreviewContent(null);
            }

            setPreviewFileData({ ...file, url });
        } catch (error) {
            console.error('Error generating file preview:', error);
        }
    }

    // Delete file from S3 and remove metadata from DynamoDB
    async function deleteFile(file) {
        try {
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: file.s3_key,
            };
            await s3Client.send(new DeleteObjectCommand(deleteParams));

            const dbParams = {
                TableName: 'user_knowledge_files',
                Key: {
                    user_id: USER_ID,
                    s3_key: file.s3_key,
                },
            };
            await dynamodb.send(new DeleteCommand(dbParams));

            await loadFiles();
            if (previewFileData?.s3_key === file.s3_key) {
                setPreviewFileData(null);
                setPreviewContent(null);
            }
            alert('File deleted successfully!');
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('An error occurred while deleting the file.');
        }
    }

    React.useEffect(() => {
        loadFiles();
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="files-section">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Knowledge Base</h2>
                                <div className="upload-section">
                                    <input
                                        type="file"
                                        onChange={handleFileSelection}
                                        className="hidden"
                                        id="file-upload"
                                        accept=".txt,.pdf,.doc,.docx"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700"
                                    >
                                        Choose File
                                    </label>
                                    <button
                                        onClick={handleFileUpload}
                                        disabled={uploading || !selectedFile}
                                        className={`ml-4 px-4 py-2 rounded-md text-white ${
                                            uploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                    </button>
                                </div>
                            </div>
                            <div className="files-grid space-y-4">
                                {files.map((file) => (
                                    <div
                                        key={file.s3_key}
                                        className={`bg-white p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer ${
                                            previewFileData?.s3_key === file.s3_key ? 'border-blue-500 border-2' : ''
                                        }`}
                                        onClick={() => previewFile(file)}
                                    >
                                        <div>
                                            <h3 className="font-medium">{file.filename}</h3>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteFile(file);
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="preview-section bg-white rounded-lg shadow-sm p-4">
                            <h3 className="text-lg font-medium mb-4">File Preview</h3>
                            {previewContent ? (
                                previewContent.type === 'text' ? (
                                    <pre className="w-full h-[600px] overflow-auto bg-gray-100 p-4 rounded">{previewContent.content}</pre>
                                ) : previewContent.type === 'pdf' ? (
                                    <iframe src={previewContent.url} className="w-full h-[600px] rounded" title="PDF Preview" />
                                ) : previewContent.type === 'docx' ? (
                                    <iframe src={previewContent.url} className="w-full h-[600px] rounded" title="DOCX Preview" />
                                ) : (
                                    <div className="text-gray-500 text-center">Unable to preview this file type</div>
                                )
                            ) : (
                                <div className="text-gray-500 text-center">Select a file to preview</div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default KnowledgeBase;