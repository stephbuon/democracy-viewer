import { getRequest, postRequest, deleteRequest, putRequest } from "./util/requests";

export const deleteDataset = async (table) =>  {
    const endpoint = `/datasets/${ table }`
    return await deleteRequest(endpoint);
};

export const addLike = async (table) =>  {
    const endpoint = `/datasets/like/${ table }`
    return await postRequest(endpoint);
};

export const deleteLike = async (table) => {
    const endpoint = `/datasets/like/${ table }`
    return await deleteRequest(endpoint);
}

export const getMetadata = async (table) => {
    const endpoint = `/datasets/metadata/full/${ table }`
    return await getRequest(endpoint);
}

export const reprocessDataset = async (table) => {
    const endpoint = `/datasets/reprocess/${ table }`
    return await putRequest(endpoint);
}