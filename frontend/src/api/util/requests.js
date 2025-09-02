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

    try {
        const res = await axios.post(fullURL, body, config);
        return res.data;
    } catch (error) {
        console.error(`API request "POST ${fullURL}" failed:`, error.message || error);
        throw error;
    }
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

export const deleteRequest = async(endpoint = {}, settings = {}) => {
    // Make API call
    const fullURL = baseURL + endpoint;
    const config = {
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

// Make API calls directly to AWS using a signed URL
export const signedURLPutRequest = async(signedUrl, body = {}, settings = {}) => {
    // Make API call
    const res = await axios.put(signedUrl, body, settings);

    // Handle error
    if (res.status !== 200) {
        console.error(`API request "PUT ${ signedUrl }" failed with status code ${ res.status }`);
        throw new Error(res.statusText);
    }

    // Return output
    return res.data;
}

export const signedURLGetRequest = async(signedUrl, query = {}, settings = {}) => {
    // Setup config
    const config = {
        ...settings,
        params: query
    };

    // Make API call
    const res = await axios.get(signedUrl, config);

    // Handle error
    if (res.status !== 200) {
        console.error(`API request "GET ${ signedUrl }" failed with status code ${ res.status }`);
        throw new Error(res.statusText);
    }

    // Return output
    return res.data;
}