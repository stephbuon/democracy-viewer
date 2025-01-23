import { getRequest } from "./util/requests";

export const filterGroups = async(params) => {
    const endpoint = `/groups/user`;
    return await getRequest(endpoint, params);
};