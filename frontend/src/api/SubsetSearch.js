import { getRequest, postRequest } from "./util/requests";

export const GetSubsetOfDataByPage = async (table, params, page = 1, pageLength = 50) =>  {
    const endpoint = `/datasets/subset/${ table }/${ page }/${ pageLength }`;
    return await getRequest(endpoint, params);
};

export const DownloadSubset = async (table, params) =>  {
    const endpoint = `/datasets/download/subset/${table}`;
    return await getRequest(endpoint, params);
};

export const DownloadIds = async (table, name) =>  {
    const endpoint = `/datasets/download/ids/${table}/${ name }`;
    return await getRequest(endpoint);
};

export const getRecordsByIds = async(table, ids) =>  {
    const endpoint = `/datasets/ids/${table}?`;
    // ids.forEach((id) => { // Add all groups in groupList to endpoint
    //     endpoint += `id=${id}&`
    // })
    // endpoint = endpoint.slice(0, -1);
    return await getRequest(endpoint, { id: ids });
};