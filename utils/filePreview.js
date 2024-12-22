function FilePreview() {
    async function getFilePreview(file) {
        try {
            if (file.objectData.type.includes('pdf')) {
                return await handlePdfPreview(file);
            } else if (file.objectData.type.includes('text')) {
                return await handleTextPreview(file);
            } else if (file.objectData.type.includes('word')) {
                return await handleDocxPreview(file);
            }
            throw new Error('Unsupported file type');
        } catch (error) {
            reportError(error);
            throw error;
        }
    }

    async function handlePdfPreview(file) {
        try {
            const blob = new Blob([file.objectData.content], { type: 'application/pdf' });
            return URL.createObjectURL(blob);
        } catch (error) {
            reportError(error);
            throw new Error('Failed to preview PDF');
        }
    }

    async function handleTextPreview(file) {
        try {
            return file.objectData.content;
        } catch (error) {
            reportError(error);
            throw new Error('Failed to preview text file');
        }
    }

    async function handleDocxPreview(file) {
        try {
            // Convert DOCX to HTML for preview
            const mammoth = window.mammoth;
            const blob = new Blob([file.objectData.content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const arrayBuffer = await blob.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            return result.value;
        } catch (error) {
            reportError(error);
            throw new Error('Failed to preview DOCX file');
        }
    }

    return {
        getFilePreview
    };
}
