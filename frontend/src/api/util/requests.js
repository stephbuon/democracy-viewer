import axios from "axios";
import { baseURL } from "./baseURL";
import { apiConfig } from "./config";

export const postRequest = async(endpoint, body = {}, settings = {}) => {
    // Make API call
    const fullURL = baseURL + endpoint;
    const config = {
        ...settings,
        ...apiConfig(settings.isFileUpload)
    };
    const res = await axios.post(fullURL, body, config);

    // Handle error
    if (res.status !== 201) {
        console.error(`API request "POST ${ fullURL }" failed with status code ${ res.status }`);
        throw new Error(res.statusText);
    }

    // Return output
    return res.data;
}

export const putRequest = async(endpoint, body = {}, settings = {}) => {
    // Make API call
    const fullURL = baseURL + endpoint;
    const config = {
        ...settings,
        ...apiConfig()
    };
    const res = await axios.put(fullURL, body, config);

    // Handle error
    if (res.status !== 200) {
        console.error(`API request "PUT ${ fullURL }" failed with status code ${ res.status }`);
        throw new Error(res.statusText);
    }

    // Return output
    return res.data;
}

export const getRequest = async(endpoint, query = {}, settings = {}) => {
    // Make API call
    const fullURL = baseURL + endpoint;
    const config = {
        ...settings,
        ...apiConfig(),
        params: query
    };
    const res = await axios.get(fullURL, config);

    // Handle error
    if (res.status !== 200) {
        console.error(`API request "GET ${ fullURL }" failed with status code ${ res.status }`);
        throw new Error(res.statusText);
    }

    // Return output
    return res.data;
}

export const deleteRequest = async(endpoint = {}, data = {}, settings = {}) => {
    // Make API call
    const fullURL = baseURL + endpoint;
    const config = {
        data,
        ...settings,
        ...apiConfig()
    };
    const res = await axios.delete(fullURL, config);

    // Handle error
    if (res.status !== 204) {
        console.error(`API request "DELETE ${ fullURL }" failed with status code ${ res.status }`);
        throw new Error(res.statusText);
    }

    // Return output
    return res.data;
}