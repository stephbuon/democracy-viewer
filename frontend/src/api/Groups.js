import { deleteRequest, getRequest, postRequest } from "./util/requests";

export const filterGroups = async(params, page = 1) => {
    const endpoint = `/groups/user/${ page }`;
    return await getRequest(endpoint, params);
};

export const createGroup = async(params) => {
    const endpoint = `/groups`;
    return await postRequest(endpoint, params);
}

export const getGroup = async(id) => {
    const endpoint = `/groups/id/${ id }`;
    return await getRequest(endpoint);
}

export const getGroupMembers = async(id, page = 1) => {
    const endpoint = `/groups/members/${ id }/${ page }`;
    return await getRequest(endpoint);
}

export const getGroupMemberRecord = async(id, email) => {
    const endpoint = `/groups/${ id }/member/${ email }`;
    return await getRequest(endpoint);
}

export const removeMemberFromGroup = async(id, email) => {
    const endpoint = `/groups/${ id }/member/${ email }`;
    return await deleteRequest(endpoint);
} 

export const addDatasetsToGroup = async(id, tables) => {
    const endpoint = `/groups/datasets`;
    return await postRequest(endpoint, { private_group: id, tables });
}

export const removeDatasetsFromGroup = async(id, tables) => {
    const endpoint = `/groups/${ id }/datasets`;
    return await deleteRequest(endpoint, { tables });
}

export const addGraphsToGroup = async(id, graph_ids) => {
    const endpoint = `/groups/graphs`;
    return await postRequest(endpoint, { private_group: id, graph_ids });
}

export const removeGraphsFromGroup = async(id, graph_ids) => {
    const endpoint = `/groups/${ id }/graphs`;
    return await deleteRequest(endpoint, { graph_ids });
}