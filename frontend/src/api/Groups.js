import { getRequest, postRequest } from "./util/requests";

export const filterGroups = async(params) => {
    const endpoint = `/groups/user`;
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

export const getGroupMembers = async(id) => {
    const endpoint = `/groups/members/${ id }`;
    return await getRequest(endpoint);
}