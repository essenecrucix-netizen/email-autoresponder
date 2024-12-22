function KnowledgeBase() {
    const [files, setFiles] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [previewContent, setPreviewContent] = React.useState('');

    async function handleFileUpload(event) {
        try {
            setUploading(true);
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target.result;
                const trickleObjAPI = new TrickleObjectAPI();
                
                await trickleObjAPI.createObject('knowledge', {
                    filename: file.name,
                    content: content,
                    type: file.type,
                    size: file.size
                });

                await loadFiles();
            };

            reader.readAsText(file);
        } catch (error) {
            reportError(error);
        } finally {
            setUploading(false);
        }
    }

    async function loadFiles() {
        try {
            const trickleObjAPI = new TrickleObjectAPI();
            const response = await trickleObjAPI.listObjects('knowledge', 100, true);
            setFiles(response.items);
        } catch (error) {
            reportError(error);
        }
    }

    async function deleteFile(objectId) {
        try {
            const trickleObjAPI = new TrickleObjectAPI();
            await trickleObjAPI.deleteObject('knowledge', objectId);
            await loadFiles();
            if (selectedFile?.objectId === objectId) {
                setSelectedFile(null);
                setPreviewContent('');
            }
        } catch (error) {
            reportError(error);
        }
    }

    async function previewFile(file) {
        try {
            setSelectedFile(file);
            if (file.objectData.type.includes('text')) {
                setPreviewContent(file.objectData.content);
            } else if (file.objectData.type.includes('pdf')) {
                const pdfUrl = URL.createObjectURL(new Blob([file.objectData.content], { type: 'application/pdf' }));
                setPreviewContent(pdfUrl);
            } else {
                setPreviewContent('Preview not available for this file type');
            }
        } catch (error) {
            reportError(error);
            setPreviewContent('Error loading preview');
        }
    }

    React.useEffect(() => {
        loadFiles();
    }, []);

    return (
        <div className="knowledge-base-container grid grid-cols-2 gap-4" data-name="knowledge-base-container">
            <div className="files-section" data-name="files-section">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold" data-name="knowledge-base-title">Knowledge Base</h2>
                    <div className="upload-section" data-name="upload-section">
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
                <div className="files-grid space-y-4" data-name="files-grid">
                    {files.map((file) => (
                        <div 
                            key={file.objectId} 
                            className={`card flex justify-between items-center cursor-pointer ${
                                selectedFile?.objectId === file.objectId ? 'border-blue-500 border-2' : ''
                            }`}
                            onClick={() => previewFile(file)}
                            data-name="file-item"
                        >
                            <div>
                                <h3 className="font-medium">{file.objectData.filename}</h3>
                                <p className="text-sm text-gray-500">
                                    Size: {Math.round(file.objectData.size / 1024)} KB
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFile(file.objectId);
                                }}
                                className="text-red-600 hover:text-red-800"
                                data-name="delete-button"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="preview-section" data-name="preview-section">
                <div className="card h-full">
                    <h3 className="text-lg font-medium mb-4">File Preview</h3>
                    {selectedFile ? (
                        <div className="preview-content" data-name="preview-content">
                            {selectedFile.objectData.type.includes('pdf') ? (
                                <iframe
                                    src={previewContent}
                                    className="w-full h-[600px]"
                                    title="PDF Preview"
                                />
                            ) : (
                                <pre className="whitespace-pre-wrap font-mono text-sm">
                                    {previewContent}
                                </pre>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center">
                            Select a file to preview
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
