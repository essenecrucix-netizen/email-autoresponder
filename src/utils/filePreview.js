function FilePreview() {
    // Cache for file previews
    const previewCache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const SUPPORTED_TYPES = {
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'md': 'text/markdown',
        'json': 'application/json',
        'csv': 'text/csv',
        'xml': 'application/xml'
    };

    async function getFilePreview(file) {
        try {
            // Check cache first
            const cachedPreview = previewCache.get(file.objectId);
            if (cachedPreview && (Date.now() - cachedPreview.timestamp) < CACHE_DURATION) {
                return cachedPreview.preview;
            }

            let preview;
            const fileType = getFileType(file);

            switch (fileType) {
                case 'pdf':
                    preview = await handlePdfPreview(file);
                    break;
                case 'txt':
                case 'md':
                case 'json':
                case 'csv':
                case 'xml':
                    preview = await handleTextPreview(file);
                    break;
                case 'docx':
                case 'doc':
                    preview = await handleDocxPreview(file);
                    break;
                default:
                    throw new Error('Unsupported file type');
            }

            // Cache the preview
            previewCache.set(file.objectId, {
                preview,
                timestamp: Date.now()
            });

            return preview;
        } catch (error) {
            reportError(error);
            throw error;
        }
    }

    function getFileType(file) {
        const extension = file.objectData.filename.split('.').pop().toLowerCase();
        return SUPPORTED_TYPES[extension] ? extension : null;
    }

    async function handlePdfPreview(file) {
        try {
            const blob = new Blob([file.objectData.content], { type: SUPPORTED_TYPES['pdf'] });
            const url = URL.createObjectURL(blob);
            
            // Clean up the URL after a delay
            setTimeout(() => URL.revokeObjectURL(url), CACHE_DURATION);
            
            return {
                type: 'pdf',
                url,
                filename: file.objectData.filename
            };
        } catch (error) {
            reportError(error);
            throw new Error('Failed to preview PDF');
        }
    }

    async function handleTextPreview(file) {
        try {
            const content = file.objectData.content;
            const extension = getFileType(file);
            
            // Format JSON if needed
            if (extension === 'json') {
                try {
                    const parsed = JSON.parse(content);
                    return {
                        type: 'text',
                        content: JSON.stringify(parsed, null, 2),
                        filename: file.objectData.filename
                    };
                } catch {
                    // If JSON parsing fails, return as plain text
                    return {
                        type: 'text',
                        content,
                        filename: file.objectData.filename
                    };
                }
            }

            return {
                type: 'text',
                content,
                filename: file.objectData.filename
            };
        } catch (error) {
            reportError(error);
            throw new Error('Failed to preview text file');
        }
    }

    async function handleDocxPreview(file) {
        try {
            const mammoth = window.mammoth;
            const blob = new Blob([file.objectData.content], { 
                type: SUPPORTED_TYPES['docx']
            });
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            
            return {
                type: 'html',
                content: result.value,
                filename: file.objectData.filename,
                warnings: result.messages
            };
        } catch (error) {
            reportError(error);
            throw new Error('Failed to preview DOCX file');
        }
    }

    function clearCache() {
        previewCache.clear();
    }

    function getSupportedTypes() {
        return { ...SUPPORTED_TYPES }; // Return a copy to prevent modification
    }

    return {
        getFilePreview,
        clearCache,
        getSupportedTypes
    };
}
