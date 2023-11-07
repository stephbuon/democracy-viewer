import axios from 'axios';

export const BACKEND_ENDPOINT = "http://localhost:8000";


const apiConfig = () => {
    let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
    return {
        headers:{
            Authorization: `Bearer ${ demoV.user.token }`
        }
    }
  };

export const CreateDataset = async (dataset) =>  {
    const formData = new FormData();
    formData.append("file", dataset);
    let headers = apiConfig();
    headers.headers = {
        ...headers.headers,
        "Content-Type": "multipart/form-data"
    }
    console.log("Creating", dataset, headers);
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets`, formData, headers);
    if(res.status !== 201){
        console.log(`Couldn't create. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const UploadDataset = async (dataset) =>  {
    console.log("Uploading", dataset, apiConfig());
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets/upload/${dataset}`, {}, apiConfig());
    if(res.status !== 201){
        console.log(`Couldn't upload. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const AddTextColumn = async (dataset,cols) =>  {
    console.log("add text cols", dataset, cols, apiConfig());
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets/text`,{dataset:dataset,cols:cols}, apiConfig());
    if(res.status !== 201){
        console.log(`Couldn't post columns. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const AddTags = async (dataset, tags) =>  {
    console.log("Adding tags", dataset, tags, apiConfig());
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets/tags`, {dataset:dataset, tags:tags}, apiConfig());
    if(res.status !== 201){
        console.log(`Couldn't add tags. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};

export const UpdateMetadata = async (dataset, title, description,is_public) =>  {
    console.log("Updating metadata", dataset, title, description,is_public, apiConfig());
    const res = await axios.put(`${BACKEND_ENDPOINT}/datasets/metadata/${dataset}`, {title, description,is_public}, apiConfig());
    if(res.status !== 200){
        console.log(`Couldn't update metadata. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};



export const GetCSVFromAPI = async (endpoint, token) =>  {
    console.log("Geting API csv", endpoint, token, apiConfig());
    const res = await axios.post(`${BACKEND_ENDPOINT}/datasets/api`, {endpoint, token});
    if(res.status !== 200){
        console.log(`Couldn't get API csv. ${res.status}`)
        return null;
    }
    console.log("Returning", res.data);
    return res.data;
};