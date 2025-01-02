import { getRequest, postRequest, putRequest } from "./util";

export const LoginRequest = async (params) =>  {
    const endpoint = `/session`
    return await postRequest(endpoint, params);
};

export const RegisterRequest = async (params) =>  {
    const endpoint = `/users`
    return await postRequest(endpoint, params);
};

export const GetSession = async () => {
    const endpoint = `/session`
    return await getRequest(endpoint);
}

export const createResetPasswordCode = async (email) => {
    const endpoint = `/users/reset/${ email }`
    return await postRequest(endpoint);
}

export const verifyResetPasswordCode = async (email, code) => {
    const endpoint = `/users/reset/verify/${ email }`
    return await getRequest(endpoint, { code });
}

export const resetPassword = async (email, password, code) => {
    const endpoint = `/users/reset/${ email }`
    return await putRequest(endpoint, { password, code});
}