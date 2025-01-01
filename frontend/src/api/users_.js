import { getRequest, putRequest, deleteRequest } from "./util/requests";

export const getUser = async(email) => {
  const endpoint = `/users/${ email }`;
  return await getRequest(endpoint);
};

export const updateUser = async(email, params) => {
  const endpoint = `/users/${ email }`;
  return await putRequest(endpoint, params);
}

export const deleteAccount = async() => {
  const endpoint = `/users`;
  return await deleteRequest(endpoint);
};