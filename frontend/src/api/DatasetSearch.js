import { getRequest, putRequest } from "./support";

export const FilterDatasets = async (params, page) =>  {
    const endpoint = `/datasets/filter/${ page }`;
    return await getRequest(endpoint, params);
};

export const FilterDatasetsCount = async (params) =>  {
    const endpoint = `/datasets/count/filter`;
    return await getRequest(endpoint, params);
};

export const GetAllTags = async (params) =>  {
    const endpoint = `/datasets/tags/unique`;
    return await getRequest(endpoint, params);
};

export const Popularize = async (dataset) =>  {
    const endpoint = `/datasets/click/${ dataset }`;
    return await putRequest(endpoint);
};