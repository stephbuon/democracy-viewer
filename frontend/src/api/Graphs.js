import { getRequest } from "./support/requests";

// Graph generation APIs
export const getGraph = async(dataset, params) => {
    const endpoint = `/graphs/${ dataset }`;
    return await getRequest(endpoint, params);
};

export const getGroupNames = async(dataset) => {
    const endpoint = `/datasets/columns/${ dataset }`;
    return await getRequest(endpoint);
};

export const getColumnValues = async(dataset, group, params) => {
    const endpoint = `/datasets/columns/${ dataset }/values/${ group }`;
    return await getRequest(endpoint, params);
};

export const getEmbedCols = async(dataset) => {
    const endpoint = `/datasets/embeddings/${ dataset }`;
    return await getRequest(endpoint);
};

export const getTopWords = async(dataset, params) => {
    const endpoint = `/datasets/words/top/${ dataset }`;
    return await getRequest(endpoint, params);
};

// Zoom APIs
export const getTextCols = async(dataset) => {
    const endpoint = `/datasets/text/${ dataset }`;
    return await getRequest(endpoint);
};

export const getZoomIds = async(dataset, params) => {
    const endpoint = `/graphs/zoom/ids/${ dataset }`;
    return await getRequest(endpoint, params);
};

export const getZoomRecords = async(dataset, params) => {
    const endpoint = `/graphs/zoom/records/${ dataset }`;
    return await getRequest(endpoint, params);
};