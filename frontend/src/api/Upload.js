import { postRequest, deleteRequest, putRequest } from "./support";

export const CreateDataset = async(dataset, setProgress) => {
    const formData = new FormData();
    formData.append("file", dataset);

    const settings = { isFileUpload: true };
    if (setProgress) {
        settings.onUploadProgress = (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(progress);
        }
    }

    const endpoint = `/datasets`;
    return await postRequest(endpoint, formData, settings);
};

export const UploadDataset = async (table_name, metadata, text, embed, tags) =>  {
    const params = {
        table_name, metadata, text, embed, tags
    };
    
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
    
    const endpoint = `/datasets/api`;
    return await postRequest(endpoint, params);
};

export const UploadStopwords = async(file, table_name) => {
    const formData = new FormData();
    formData.append("file", file);
    const settings = { isFileUpload: true };

    const endpoint = `/datasets/upload/stopwords/${ table_name }`;
    return await postRequest(endpoint, formData, settings);
};