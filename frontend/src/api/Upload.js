import { postRequest, deleteRequest, getRequest, signedURLPutRequest } from "./util";

export const getTempCols = async(table_name) => {
    const endpoint = `/datasets/columns/${ table_name }/temp`;
    return await getRequest(endpoint);
}

// Main function that handles dataset upload and configuration
export const CreateAndConfigureDataset = async(dataset, metadata, textCols, embedCols, tags, setProgress, setStatus) => {
    try {
        // Step 1: Upload the file (chunked or standard based on size)
        if (setStatus) setStatus('Uploading file...');
        const uploadResult = await CreateDataset(dataset, setProgress);
        
        // Step 2: Configure the dataset and trigger processing
        if (setStatus) setStatus('Configuring dataset and starting processing...');
        await UploadDataset(
            uploadResult.table_name, 
            metadata, 
            textCols, 
            embedCols, 
            tags
        );
        
        if (setStatus) setStatus('Dataset uploaded and processing started!');
        return uploadResult;
        
    } catch (error) {
        console.error('Upload or configuration failed:', error);
        if (setStatus) setStatus('Upload failed');
        throw error;
    }
};

export const CreateDataset = async(dataset, setProgress) => {
    // File size limits
    const MAX_FILE_SIZE = 15 * 1024 * 1024 * 1024; // 15GB maximum
    const CHUNK_SIZE_THRESHOLD = 2.5 * 1024 * 1024 * 1024; // 2.5GB threshold for chunked upload
    
    // Check if file exceeds maximum allowed size
    if (dataset.size > MAX_FILE_SIZE) {
        const fileSizeGB = (dataset.size / (1024 * 1024 * 1024)).toFixed(2);
        throw new Error(`File size (${fileSizeGB} GB) exceeds the maximum allowed size of 15 GB. Please reduce your file size and try again.`);
    }
    
    if (dataset.size > CHUNK_SIZE_THRESHOLD) {
        return await CreateDatasetChunked(dataset, setProgress);
    } else {
        return await CreateDatasetStandard(dataset, setProgress);
    }
};

// Standard upload for files under 2.5GB
export const CreateDatasetStandard = async(dataset, setProgress) => {
    const { table_name, url } = await postRequest(`/datasets`);

    const settings = {
        headers: {
            "Content-Type": "text/csv"
        },
        maxBodyLength: Infinity,
        timeout: 0
    };

    if (setProgress) {
        settings.onUploadProgress = (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(progress);
        }
    }
    // Upload dataset to signed url
    await signedURLPutRequest(url, dataset, settings);

    // Get temporary columns for modal
    const headers = await getTempCols(table_name);

    return { table_name, headers };
};

// Chunked upload for files > 2.5GB
export const CreateDatasetChunked = async(dataset, setProgress) => {
    try {
        console.log('=== STARTING CHUNKED UPLOAD ===');
        console.log(`File size: ${(dataset.size / (1024 * 1024 * 1024)).toFixed(2)} GB`);
        if (setProgress) setProgress(5);

        const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks for large files
        const totalChunks = Math.ceil(dataset.size / CHUNK_SIZE);
        console.log(`CHUNK_SIZE: ${CHUNK_SIZE / (1024 * 1024)} MB, totalChunks: ${totalChunks}`);
        console.log(`Expected chunks: 0 to ${totalChunks - 1}`);

        // Initialize chunked upload session
        const initResponse = await postRequest('/datasets/initialize-chunked-upload', {
            totalChunks,
            originalFileName: dataset.name
        });

        const { sessionId } = initResponse;
        console.log('Session initialized:', sessionId);
        if (setProgress) setProgress(10);

        // Upload chunks sequentially
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, dataset.size);
            const chunk = dataset.slice(start, end);

            console.log(`Uploading chunk ${i + 1}/${totalChunks} (${(chunk.size / (1024 * 1024)).toFixed(1)} MB)`);

            const formData = new FormData();
            formData.append('sessionId', sessionId);
            formData.append('chunkIndex', i.toString());
            formData.append('chunk', chunk);

            await postRequest('/datasets/upload-chunk', formData, {
                isFileUpload: true,
                timeout: 0
            });

            if (setProgress) {
                const chunkProgress = 10 + ((i + 1) / totalChunks) * 80;
                setProgress(Math.round(chunkProgress));
            }
        }

        console.log(`ALL ${totalChunks} CHUNKS UPLOADED! (0 to ${totalChunks - 1})`);
        console.log('Starting finalize request...');

        // Finalize the chunked upload
        try {
            const finalizeResponse = await postRequest('/datasets/finalize-chunked-upload', {
                sessionId
            });
            console.log('Finalize SUCCESS:', finalizeResponse);
            
            if (setProgress) setProgress(100);

            return {
                table_name: finalizeResponse.table_name,
                headers: finalizeResponse.headers
            };
        } catch (finalizeError) {
            console.error('FINALIZE REQUEST FAILED:', finalizeError);
            console.error('Finalize error details:', finalizeError.response?.data || finalizeError.message);
            throw finalizeError;
        }

    } catch (error) {
        console.error('OVERALL CHUNKED UPLOAD FAILED:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
};

export const UploadDataset = async (table_name, metadata, text, embed, tags) =>  {
    const params = {
        table_name, metadata, text, embed, tags
    };
    console.log("UploadDataset params:", params);

    const endpoint = `/datasets/upload`;
    return await postRequest(endpoint, params);
};

export const AddTags = async (dataset, tags) =>  {
    const params = {
        dataset, tags
    };

    const endpoint = `/datasets/tags`;
    return await postRequest(endpoint, params);
};

export const DeleteTag = async (dataset, tag) =>  {
    const endpoint = `/datasets/${ dataset }/tags/${ tag }`;
    return await deleteRequest(endpoint);
};

export const UpdateMetadata = async (dataset, params) =>  {
    const endpoint = `/datasets/metadata/${ dataset }`;
    return await postRequest(endpoint, params);
};

export const GetCSVFromAPI = async(endpoint, token) => {
    const params = {
        endpoint, token
    };

    const endpoint_ = `/datasets/api`;
    return await postRequest(endpoint_, params);
};

export const UploadStopwords = async(file, table, setProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const settings = {
        isFileUpload: true,
        timeout: 0
    };
    if (setProgress) {
        settings.onUploadProgress = (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(progress);
        }
    }

    const endpoint = `/datasets/upload/stopwords/${ table }`;
    return await postRequest(endpoint, formData, settings);
};