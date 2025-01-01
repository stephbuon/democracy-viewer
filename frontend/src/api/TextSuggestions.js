import { getRequest, postRequest, deleteRequest, putRequest } from "./util/requests";

export const addSuggestion = async (params) =>  {
    const endpoint = `/datasets/suggest`;
    return await postRequest(endpoint, params);
};

export const getSuggestionsFor = async (params) =>  {
    const endpoint = `/datasets/suggest/for`;
    return await getRequest(endpoint, params);
};

export const getSuggestionsFrom = async (params) =>  {
    const endpoint = `/datasets/suggest/from`;
    return await getRequest(endpoint, params);
};

export const getSuggestion = async (id) =>  {
    const endpoint = `/datasets/suggest/id/${ id }`;
    return await getRequest(endpoint);
};

export const confirmSuggestion = async (id) =>  {
    const endpoint = `/datasets/suggest/${ id }`;
    return await putRequest(endpoint, params);
};

export const deleteSuggestion = async (id) =>  {
    const endpoint = `/datasets/suggest/${ id }`;
    return await deleteRequest(endpoint, params);
};