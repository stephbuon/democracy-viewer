import { getRequest, postRequest, signedURLPutRequest, deleteRequest, putRequest } from "./util/requests";

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

// Published graph APIs
export const publishGraph = async(params, graph) => {
    // Run API to get AWS signed URL
    const endpoint = `/graphs/publish`;
    const result = await postRequest(endpoint, params);

    // Upload graph if it is not a duplicate
    if (result.url !== "Already uploaded") {
        await signedURLPutRequest(
            result.url, 
            graph, 
            {
                headers: {
                    "Content-Type": "image/png"
                },
                maxBodyLength: Infinity
            }
        );
    }

    return result.id;
}

export const uploadGraphMetadata = async(params) => {
    const endpoint = `/graphs/metadata`;
    return await postRequest(endpoint, params);
}

export const filterGraphs = async(params, page) => {
    const endpoint = `/graphs/filter/${ page }`;
    return await getRequest(endpoint, params);
}

export const filterGraphsCount = async(params) => {
    const endpoint = `/graphs/count/filter`;
    return await getRequest(endpoint, params);
}

export const getGraphImageUrl = async(id) => {
    const endpoint = `/graphs/image/${ id }`;
    return await getRequest(endpoint);
}

export const getPublishedGraph = async(id) => {
    const endpoint = `/graphs/id/${ id }`;
    return await getRequest(endpoint);
}

export const bookmarkGraph = async(id) => {
    const endpoint = `/graphs/like/${ id }`;
    return await postRequest(endpoint);
}

export const unbookmarkGraph = async(id) => {
    const endpoint = `/graphs/like/${ id }`;
    return await deleteRequest(endpoint);
}

export const updateGraphMetadata = async(id, params) => {
    const endpoint = `/graphs/metadata/${ id }`;
    return await putRequest(endpoint, params);
}

export const deleteGraph = async(id) => {
    const endpoint = `/graphs/${ id }`;
    return await deleteRequest(endpoint);
}