import React from 'react';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
const USER_ID = process.env.REACT_APP_USER_ID; // Replace with user-specific ID (e.g., from authentication)

function KnowledgeBase() {
    const [files, setFiles] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);

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
            setFiles(response.Items);
        } catch (error) {
            console.error('Error loading files from DynamoDB:', error);
        }
    }

    // Handle file upload to S3 and save metadata to DynamoDB
    async function handleFileUpload(event) {
        try {
            setUploading(true);
            const file = event.target.files[0];
            const s3Key = `${USER_ID}/${file.name}`;

            // Upload file to S3
            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: file,
                ContentType: file.type,
            };
            await s3Client.send(new PutObjectCommand(uploadParams));

            // Save file metadata to DynamoDB
            const dbParams = {
                TableName: 'user_knowledge_files',
                Item: {
                    user_id: USER_ID,
                    s3_key: s3Key,
                    filename: file.name,
                    uploaded_at: new Date().toISOString(),
                },
            };
            await dynamodb.send(new PutCommand(dbParams));

            await loadFiles();
        } catch (error) {
            console.error('Error uploading file:', error);
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
            setSelectedFile({ ...file, url });
        } catch (error) {
            console.error('Error generating file preview:', error);
        }
    }

    // Delete file from S3 and remove metadata from DynamoDB
    async function deleteFile(file) {
        try {
            // Delete file from S3
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: file.s3_key,
            };
            await s3Client.send(new DeleteObjectCommand(deleteParams));

            // Remove metadata from DynamoDB
            const dbParams = {
                TableName: 'user_knowledge_files',
                Key: {
                    user_id: USER_ID,
                    s3_key: file.s3_key,
                },
            };
            await dynamodb.send(new DeleteCommand(dbParams));

            await loadFiles();
            if (selectedFile?.s3_key === file.s3_key) {
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
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
                    {files.map((file) => (
                        <div
                            key={file.s3_key}
                            className={`card flex justify-between items-center cursor-pointer ${
                                selectedFile?.s3_key === file.s3_key ? 'border-blue-500 border-2' : ''
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