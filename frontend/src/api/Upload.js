import { postRequest, deleteRequest, putRequest, getRequest, signedURLPutRequest } from "./util";

export const getTempCols = async(table_name) => {
    const endpoint = `/datasets/columns/${ table_name }/temp`;
    return await getRequest(endpoint);
}

export const CreateDataset = async(dataset, setProgress) => {
    // Create dataset to get signed url and table name
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
    await signedURLPutRequest(url,  dataset, settings);

    // Get temporary columns for modal
    const headers = await getTempCols(table_name);

    return { table_name, headers };
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